import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, DollarSign, Activity as ActivityIcon, Clock, Plus, Check, X, AlertCircle } from 'lucide-react';
import { getActivitiesForCity, updateTrip } from '../../services/tripApi';
import { Trip, Activity } from '../../types/trip';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface ActivityDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

export const ActivityDiscoveryModal: React.FC<ActivityDiscoveryModalProps> = ({
  isOpen,
  onClose,
  trip,
  onTripUpdated
}) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [activities, setActivities] = useState<Partial<Activity>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Activity addition flag
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCostRange, setSelectedCostRange] = useState('All');

  // Expanded card for scheduling form
  const [schedulingActivityIndex, setSchedulingActivityIndex] = useState<number | null>(null);

  // Schedule sub-form states
  const [schedDate, setSchedDate] = useState('');
  const [schedStartTime, setSchedStartTime] = useState('10:00');
  const [schedEndTime, setSchedEndTime] = useState('12:00');
  const [schedCost, setSchedCost] = useState<number>(0);
  const [schedDescription, setSchedDescription] = useState('');
  const [schedName, setSchedName] = useState('');
  const [schedCategory, setSchedCategory] = useState<'Transport' | 'Accommodation' | 'Activities' | 'Food' | 'Other'>('Activities');
  const [schedDuration, setSchedDuration] = useState('2 hours');

  // Reset form states
  const resetForm = () => {
    setSchedulingActivityIndex(null);
    setIsCustomMode(false);
    setSchedName('');
    setSchedCategory('Activities');
    setSchedDuration('2 hours');
    setSchedCost(0);
    setSchedDescription('');
    setSchedStartTime('10:00');
    setSchedEndTime('12:05');
  };

  // Get active city stops from trip destinations
  const cityStops = useMemo(() => {
    return trip.destinations || [];
  }, [trip]);

  // Set default city to first stop if available
  useEffect(() => {
    if (isOpen && cityStops.length > 0 && !selectedCity) {
      setSelectedCity(cityStops[0].city);
    }
  }, [isOpen, cityStops, selectedCity]);

  // Fetch activities when selected city changes
  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedCity) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getActivitiesForCity(selectedCity);
        setActivities(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch activity recommendations.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen && selectedCity) {
      fetchActivities();
      resetForm();
    }
  }, [selectedCity, isOpen]);

  // Setup default date to start date of the trip
  useEffect(() => {
    if (isOpen && trip.startDate) {
      setSchedDate(trip.startDate);
    }
  }, [isOpen, trip]);

  // List of valid dates for dropdown selection
  const tripDates = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return [];
    const dates = [];
    const current = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    let limit = 100;
    while (current <= end && limit > 0) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
      limit--;
    }
    return dates;
  }, [trip]);

  // Filter logic
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const nameMatch = (a.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = selectedCategory === 'All' || a.category === selectedCategory;
      
      let costMatch = true;
      if (selectedCostRange !== 'All') {
        const cost = a.cost || 0;
        if (selectedCostRange === 'free') costMatch = cost === 0;
        else if (selectedCostRange === 'low') costMatch = cost > 0 && cost <= 2000;
        else if (selectedCostRange === 'med') costMatch = cost > 2000 && cost <= 6000;
        else if (selectedCostRange === 'high') costMatch = cost > 6000;
      }

      return nameMatch && catMatch && costMatch;
    });
  }, [activities, searchQuery, selectedCategory, selectedCostRange]);

  const handleOpenSchedule = (act: Partial<Activity>, idx: number) => {
    setSchedulingActivityIndex(idx);
    setIsCustomMode(false);
    setSchedName(act.name || '');
    setSchedCategory((act.category as any) || 'Activities');
    setSchedCost(act.cost || 0);
    setSchedDuration(act.duration || '2 hours');
    setSchedDescription(act.description || '');
  };

  const handleOpenCustom = () => {
    setSchedulingActivityIndex(null);
    setIsCustomMode(true);
    setSchedName('');
    setSchedCategory('Activities');
    setSchedCost(2000);
    setSchedDuration('2 hours');
    setSchedDescription('');
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedName.trim()) {
      setError('Activity name is required.');
      return;
    }
    if (!schedDate) {
      setError('Please select a scheduled date.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newActivity: Activity = {
        id: 'act-' + Math.random().toString(36).substr(2, 9),
        name: schedName,
        category: schedCategory,
        cost: Number(schedCost) || 0,
        date: schedDate,
        startTime: schedStartTime,
        endTime: schedEndTime,
        duration: schedDuration,
        description: schedDescription,
        location: selectedCity
      };

      // Add to trip activities
      const updatedActivities = [...(trip.activities || []), newActivity];

      // Re-allocate budget categories dynamically
      const currentBudget = trip.budget || { totalBudget: 50000, transport: 0, accommodation: 0, activities: 0, food: 0, other: 0 };
      const updatedBudget = { ...currentBudget };
      
      const categoryKey = schedCategory.toLowerCase();
      if (categoryKey.includes('transport')) updatedBudget.transport += newActivity.cost;
      else if (categoryKey.includes('accommodation')) updatedBudget.accommodation += newActivity.cost;
      else if (categoryKey.includes('food')) updatedBudget.food += newActivity.cost;
      else if (categoryKey.includes('activities') || categoryKey.includes('activity')) updatedBudget.activities += newActivity.cost;
      else updatedBudget.other += newActivity.cost;

      const updated = await updateTrip(trip.id, {
        activities: updatedActivities,
        budget: updatedBudget
      });

      onTripUpdated(updated);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(`Failed to save activity: ${err.message || 'Error occurred.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discover & Schedule Activities"
      size="lg"
      footer={
        <div className="flex gap-2 justify-end w-full">
          {schedulingActivityIndex !== null || isCustomMode ? (
            <Button variant="outline" size="sm" onClick={resetForm}>
              Back to List
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-left">
        
        {/* City Switcher Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Stop</label>
            {cityStops.length === 0 ? (
              <span className="text-xs font-bold text-red-500">Add city stops in the Overview tab first!</span>
            ) : (
              <div className="flex gap-1.5 flex-wrap">
                {cityStops.map(stop => (
                  <button
                    key={stop.id}
                    onClick={() => setSelectedCity(stop.city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedCity === stop.city
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📍 {stop.city}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {cityStops.length > 0 && !isCustomMode && schedulingActivityIndex === null && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenCustom}
              className="text-[10px] font-bold py-1 border-dashed hover:border-indigo-400 hover:text-indigo-600"
            >
              + Custom Activity
            </Button>
          )}
        </div>

        {/* Global Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Condition 1: Scheduling Form for Selected Activity */}
        {(schedulingActivityIndex !== null || isCustomMode) ? (
          <form onSubmit={handleAddActivitySubmit} className="flex flex-col gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-xl animate-in zoom-in-95 duration-200">
            <h4 className="font-extrabold text-slate-800 text-xs tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-600" />
              Schedule Stops: {schedName || 'New Custom Activity'}
            </h4>

            {isCustomMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Activity Name *"
                  value={schedName}
                  onChange={(e) => setSchedName(e.target.value)}
                  placeholder="e.g. Traditional Cooking Show, River Kayaking"
                />
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={schedCategory}
                    onChange={(e) => setSchedCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Activities">Activities</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Day *</label>
                <select
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white focus:outline-none"
                >
                  {tripDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Start Time"
                type="time"
                value={schedStartTime}
                onChange={(e) => setSchedStartTime(e.target.value)}
              />

              <Input
                label="End Time"
                type="time"
                value={schedEndTime}
                onChange={(e) => setSchedEndTime(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cost Estimation (INR) *"
                type="number"
                min="0"
                value={schedCost}
                onChange={(e) => setSchedCost(Number(e.target.value))}
              />

              <Input
                label="Duration (optional)"
                placeholder="e.g. 2 hours, 1 day"
                value={schedDuration}
                onChange={(e) => setSchedDuration(e.target.value)}
              />
            </div>

            <Input
              label="Activity Notes / Location Details"
              isTextArea={true}
              placeholder="e.g. Meeting point, reservation reference, dress code guidelines..."
              value={schedDescription}
              onChange={(e) => setSchedDescription(e.target.value)}
            />

            <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-semibold px-5">
                Confirm & Add
              </Button>
            </div>
          </form>
        ) : (
          // Condition 2: Search List of Activities
          <div className="flex flex-col gap-4">
            {cityStops.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recommended activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-slate-200 rounded-xl p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Activities">Activities</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={selectedCostRange}
                  onChange={(e) => setSelectedCostRange(e.target.value)}
                  className="border border-slate-200 rounded-xl p-2 text-xs bg-white focus:outline-none"
                >
                  <option value="All">All Budgets</option>
                  <option value="free">Free</option>
                  <option value="low">Under ₹2000</option>
                  <option value="med">₹2000 - ₹6000</option>
                  <option value="high">Over ₹6000</option>
                </select>
              </div>
            )}

            <div className="max-h-[45vh] overflow-y-auto pr-1 flex flex-col gap-3">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 animate-pulse bg-slate-50/40 h-20" />
                ))
              ) : cityStops.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <ActivityIcon size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">Stops list is empty</p>
                  <p className="text-[10px] text-slate-400 mt-1">Please add a city stop to your trip before searching activities.</p>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Search size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No matching activities found</p>
                  <p className="text-[10px] text-slate-400 mt-1">Try clearing your filters or create a Custom Activity instead.</p>
                </div>
              ) : (
                filteredActivities.map((act, index) => (
                  <div key={index} className="border border-slate-100 rounded-xl p-3.5 hover:border-slate-200 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{act.name}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                          {act.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {act.description}
                      </p>
                      <div className="flex gap-3 text-[10px] text-slate-400 font-semibold mt-2">
                        {act.duration && <span>⏱️ {act.duration}</span>}
                        <span>💰 Est: ₹{act.cost?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenSchedule(act, index)}
                      leftIcon={<Plus size={12} />}
                      className="py-1 px-3 text-[10px] font-bold self-start sm:self-auto"
                    >
                      Schedule
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
