import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Edit2, Calendar, MapPin, 
  Activity, Check, X, Clock, Save
} from 'lucide-react';
import { Trip, TripStop, Activity as TripActivity } from '../../types/trip';
import { updateTrip } from '../../services/tripApi';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';

interface ItineraryBuilderProps {
  trip: Trip;
  onSaveSuccess?: (updatedTrip: Trip) => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ trip, onSaveSuccess }) => {
  const { showToast } = useToast();
  
  // Local state tracking stops and activities
  const [stops, setStops] = useState<TripStop[]>([]);
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Forms state
  const [showAddStop, setShowAddStop] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newArrival, setNewArrival] = useState('');
  const [newDeparture, setNewDeparture] = useState('');

  // Editing stop dates state
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editArrival, setEditArrival] = useState('');
  const [editDeparture, setEditDeparture] = useState('');

  // Activity Form state
  const [showAddActivityStopId, setShowAddActivityStopId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  
  const [actName, setActName] = useState('');
  const [actCategory, setActCategory] = useState<'Transport' | 'Accommodation' | 'Activities' | 'Food' | 'Other'>('Activities');
  const [actDate, setActDate] = useState('');
  const [actStartTime, setActStartTime] = useState('');
  const [actEndTime, setActEndTime] = useState('');
  const [actCost, setActCost] = useState('0');
  const [actLocation, setActLocation] = useState('');
  const [actDescription, setActDescription] = useState('');

  // Hydrate local state from prop
  useEffect(() => {
    if (trip) {
      setStops(trip.tripStops ? [...trip.tripStops].sort((a, b) => a.order - b.order) : []);
      setActivities(trip.activities ? [...trip.activities].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []);
    }
  }, [trip]);

  // Helper: Get list of dates between stop start/end
  const getStopDates = (stop: TripStop) => {
    const dates: string[] = [];
    const start = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    
    // Safety guard to prevent infinite loops on invalid range
    if (start > end) return [];
    
    const curr = new Date(start);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };


  // ==========================================
  // STOPS ACTIONS
  // ==========================================

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || !newCountry.trim() || !newArrival || !newDeparture) {
      showToast('All city stop parameters are required.', 'error');
      return;
    }

    // Validations: stop range within overall trip dates
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const stopStart = new Date(newArrival);
    const stopEnd = new Date(newDeparture);

    if (stopStart < tripStart || stopEnd > tripEnd) {
      showToast(`Stops must lie within overall trip dates: ${trip.startDate} to ${trip.endDate}`, 'error');
      return;
    }

    if (stopStart > stopEnd) {
      showToast('Departure date must be after arrival date.', 'error');
      return;
    }

    const newStop: TripStop = {
      id: 'stop-' + Math.random().toString(36).substr(2, 9),
      city: newCity.trim(),
      country: newCountry.trim(),
      startDate: newArrival,
      endDate: newDeparture,
      order: stops.length
    };

    setStops(prev => [...prev, newStop]);
    setNewCity('');
    setNewCountry('');
    setNewArrival('');
    setNewDeparture('');
    setShowAddStop(false);
    showToast(`Added stop to ${newStop.city}.`, 'info');
  };

  const handleRemoveStop = (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;

    if (!window.confirm(`Remove city stop "${stop.city}"? This will also unlink its activities.`)) return;

    // Unlink or delete activities associated with this stop
    setActivities(prev => prev.filter(act => act.tripStopId !== stopId));
    
    // Remove stop and re-order
    const updatedStops = stops
      .filter(s => s.id !== stopId)
      .map((s, index) => ({ ...s, order: index }));

    setStops(updatedStops);
    showToast(`Removed stop ${stop.city}.`, 'info');
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stops.length - 1) return;

    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    // Recalculate orders
    const updated = newStops.map((s, idx) => ({ ...s, order: idx }));
    setStops(updated);
  };

  const startEditStopDates = (stop: TripStop) => {
    setEditingStopId(stop.id);
    setEditArrival(stop.startDate);
    setEditDeparture(stop.endDate);
  };

  const handleSaveStopDates = (stopId: string) => {
    if (!editArrival || !editDeparture) {
      showToast('Arrival and departure dates are required.', 'error');
      return;
    }

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const stopStart = new Date(editArrival);
    const stopEnd = new Date(editDeparture);

    if (stopStart < tripStart || stopEnd > tripEnd) {
      showToast(`Stops must lie within overall trip dates: ${trip.startDate} to ${trip.endDate}`, 'error');
      return;
    }

    if (stopStart > stopEnd) {
      showToast('Departure date must be after arrival date.', 'error');
      return;
    }

    // Update stop stay dates
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, startDate: editArrival, endDate: editDeparture } : s));
    
    // Auto-adjust or validate activities that fall outside this new range
    setActivities(prev => prev.map(act => {
      if (act.tripStopId === stopId && act.date) {
        const actD = new Date(act.date);
        // If outside new range, shift activity to new start date
        if (actD < stopStart || actD > stopEnd) {
          return { ...act, date: editArrival };
        }
      }
      return act;
    }));

    setEditingStopId(null);
    showToast('Updated stay dates.', 'info');
  };

  // ==========================================
  // ACTIVITIES ACTIONS
  // ==========================================

  const handleOpenAddActivity = (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;
    
    setShowAddActivityStopId(stopId);
    setEditingActivityId(null);
    setActName('');
    setActCategory('Activities');
    setActDate(stop.startDate); // Default to stop start date
    setActStartTime('');
    setActEndTime('');
    setActCost('0');
    setActLocation('');
    setActDescription('');
  };

  const handleOpenEditActivity = (act: TripActivity) => {
    setEditingActivityId(act.id);
    setShowAddActivityStopId(act.tripStopId || null);
    setActName(act.name);
    setActCategory(act.category);
    setActDate(act.date || '');
    setActStartTime(act.startTime || '');
    setActEndTime(act.endTime || '');
    setActCost(act.cost.toString());
    setActLocation(act.location || '');
    setActDescription(act.description || '');
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actName.trim() || !actDate) {
      showToast('Activity Name and Date are required.', 'error');
      return;
    }

    const stopId = showAddActivityStopId;
    if (!stopId) return;

    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;

    // Validation: activity date in city date range
    const actD = new Date(actDate);
    const stopStart = new Date(stop.startDate);
    const stopEnd = new Date(stop.endDate);

    if (actD < stopStart || actD > stopEnd) {
      showToast(`Activity date must fall between stop stay dates: ${stop.startDate} to ${stop.endDate}`, 'error');
      return;
    }

    // Validation: end time >= start time
    if (actStartTime && actEndTime) {
      const [startH, startM] = actStartTime.split(':').map(Number);
      const [endH, endM] = actEndTime.split(':').map(Number);
      if (endH < startH || (endH === startH && endM < startM)) {
        showToast('Activity End Time cannot be before Start Time.', 'error');
        return;
      }
    }

    const costNum = parseFloat(actCost);
    if (isNaN(costNum) || costNum < 0) {
      showToast('Activity Cost must be a positive number.', 'error');
      return;
    }

    if (editingActivityId) {
      // Edit mode
      setActivities(prev => prev.map(a => a.id === editingActivityId ? {
        ...a,
        name: actName.trim(),
        category: actCategory,
        date: actDate,
        startTime: actStartTime || undefined,
        endTime: actEndTime || undefined,
        cost: costNum,
        location: actLocation.trim() || undefined,
        description: actDescription.trim() || undefined
      } : a));
      showToast('Activity updated.', 'info');
    } else {
      // Create mode
      const newAct: TripActivity = {
        id: 'act-' + Math.random().toString(36).substr(2, 9),
        name: actName.trim(),
        category: actCategory,
        date: actDate,
        startTime: actStartTime || undefined,
        endTime: actEndTime || undefined,
        cost: costNum,
        location: actLocation.trim() || undefined,
        description: actDescription.trim() || undefined,
        tripStopId: stopId,
        order: activities.filter(a => a.tripStopId === stopId).length
      };
      setActivities(prev => [...prev, newAct]);
      showToast('Activity added.', 'info');
    }

    setShowAddActivityStopId(null);
    setEditingActivityId(null);
  };

  const handleRemoveActivity = (actId: string) => {
    if (!window.confirm('Delete this activity?')) return;
    setActivities(prev => prev.filter(a => a.id !== actId));
    showToast('Activity deleted.', 'info');
  };

  const moveActivity = (stopId: string, index: number, direction: 'up' | 'down') => {
    const stopActs = activities.filter(a => a.tripStopId === stopId);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stopActs.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const item1 = stopActs[index];
    const item2 = stopActs[targetIndex];

    // Swap ordering indices
    const updated = activities.map(a => {
      if (a.id === item1.id) {
        return { ...a, order: targetIndex };
      }
      if (a.id === item2.id) {
        return { ...a, order: index };
      }
      return a;
    });

    setActivities(updated);
  };

  // ==========================================
  // GENERAL ITINERARY SAVE
  // ==========================================

  const handleSaveItinerary = async () => {
    setIsSaving(true);
    showToast('Saving itinerary...', 'info');
    try {
      // Sort final arrays to save cleanly
      const finalStops = [...stops].sort((a, b) => a.order - b.order);
      const finalActivities = [...activities].sort((a, b) => {
        // Sort chronologically by date/time, then by order index
        if (a.date !== b.date) {
          return (a.date || '') > (b.date || '') ? 1 : -1;
        }
        if (a.startTime !== b.startTime) {
          return (a.startTime || '') > (b.startTime || '') ? 1 : -1;
        }
        return (a.order ?? 0) - (b.order ?? 0);
      });

      // Synchronize budget values to include these activities if possible
      // Let's summarize the total cost of all activities in this builder
      const totalActivitiesCost = finalActivities.reduce((sum, act) => sum + act.cost, 0);
      const updatedBudget = trip.budget 
        ? {
            ...trip.budget,
            activities: totalActivitiesCost
          }
        : undefined;

      const updated = await updateTrip(trip.id, {
        tripStops: finalStops,
        activities: finalActivities,
        budget: updatedBudget
      });

      showToast('Itinerary saved successfully.', 'success');
      if (onSaveSuccess) onSaveSuccess(updated);
    } catch (err: any) {
      console.error(err);
      showToast('Unable to save itinerary.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper colors for activity categories
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Transport': return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      case 'Accommodation': return 'bg-teal-50 border-teal-100 text-teal-700';
      case 'Food': return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'Activities': return 'bg-amber-50 border-amber-100 text-amber-700';
      default: return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left" id="itinerary-builder">
      
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Itinerary: {trip.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Overall: {trip.startDate} to {trip.endDate}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddStop(prev => !prev)}
            leftIcon={<Plus size={14} />}
            className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Add Stop (City)
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSaveItinerary}
            disabled={isSaving}
            leftIcon={<Save size={14} />}
            className="text-xs font-bold shadow-lg shadow-indigo-600/10"
          >
            {isSaving ? 'Saving...' : 'Save Itinerary'}
          </Button>
        </div>
      </div>

      {/* Add Stop Dialog Panel */}
      {showAddStop && (
        <form onSubmit={handleAddStop} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add City Stop Stop</h4>
            <button type="button" onClick={() => setShowAddStop(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">City Name</label>
              <Input
                placeholder="e.g. Paris"
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Country Name</label>
              <Input
                placeholder="e.g. France"
                value={newCountry}
                onChange={e => setNewCountry(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Arrival Date</label>
              <Input
                type="date"
                value={newArrival}
                min={trip.startDate}
                max={trip.endDate}
                onChange={e => setNewArrival(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Departure Date</label>
              <Input
                type="date"
                value={newDeparture}
                min={newArrival || trip.startDate}
                max={trip.endDate}
                onChange={e => setNewDeparture(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowAddStop(false)} className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="text-xs font-bold">
              Add Stop
            </Button>
          </div>
        </form>
      )}

      {/* Main List of Stops */}
      {stops.length === 0 ? (
        <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[30vh]">
          <MapPin size={36} className="text-slate-750 mb-3" />
          <h4 className="font-bold text-xs text-slate-400">No stops configured yet</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
            Stops represent the cities/regions you will visit during your journey. Configure your first city stop to begin schedule activities!
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowAddStop(true)} leftIcon={<Plus size={14} />}>
            Add First Stop
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {stops.map((stop, stopIndex) => {
            const stopActs = activities
              .filter(a => a.tripStopId === stop.id)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            return (
              <div key={stop.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm hover:border-slate-850 transition-colors">
                
                {/* Stop Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-extrabold flex items-center justify-center text-xs">
                      #{stopIndex + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        {stop.city}, <span className="font-medium text-slate-400">{stop.country}</span>
                      </h4>
                      
                      {editingStopId === stop.id ? (
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <input
                            type="date"
                            value={editArrival}
                            min={trip.startDate}
                            max={trip.endDate}
                            onChange={e => setEditArrival(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded outline-none"
                          />
                          <span className="text-slate-600 text-[10px]">to</span>
                          <input
                            type="date"
                            value={editDeparture}
                            min={editArrival || trip.startDate}
                            max={trip.endDate}
                            onChange={e => setEditDeparture(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded outline-none"
                          />
                          <button onClick={() => handleSaveStopDates(stop.id)} className="text-emerald-500 hover:text-emerald-400">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingStopId(null)} className="text-rose-500 hover:text-rose-400">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                          <Calendar size={11} className="text-indigo-400" />
                          <span>{stop.startDate} to {stop.endDate}</span>
                          <button onClick={() => startEditStopDates(stop)} className="text-indigo-400 hover:text-indigo-300 ml-1">
                            <Edit2 size={11} />
                          </button>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order and remove controls */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => moveStop(stopIndex, 'up')}
                      disabled={stopIndex === 0}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button 
                      onClick={() => moveStop(stopIndex, 'down')}
                      disabled={stopIndex === stops.length - 1}
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button 
                      onClick={() => handleRemoveStop(stop.id)}
                      className="p-1.5 bg-slate-900 border border-rose-950/20 text-rose-500 hover:text-white hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer ml-2"
                      title="Remove Stop"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stop Activities */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activities Timeline</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenAddActivity(stop.id)}
                      leftIcon={<Plus size={12} />}
                      className="text-[10px] py-1 border border-indigo-950/10 hover:bg-slate-900 text-indigo-400 font-bold"
                    >
                      Add Activity
                    </Button>
                  </div>

                  {/* Add/Edit Activity Modal Block */}
                  {showAddActivityStopId === stop.id && (
                    <form onSubmit={handleSaveActivity} className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">
                          {editingActivityId ? 'Update Activity' : 'Add Activity Stop'}
                        </h5>
                        <button type="button" onClick={() => { setShowAddActivityStopId(null); setEditingActivityId(null); }} className="text-slate-400 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name</label>
                          <Input
                            placeholder="e.g. Louvre Tour"
                            value={actName}
                            onChange={e => setActName(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                          <select
                            value={actCategory}
                            onChange={e => setActCategory(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-900/30"
                          >
                            <option value="Activities">Activities</option>
                            <option value="Transport">Transport</option>
                            <option value="Accommodation">Accommodation</option>
                            <option value="Food">Food</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date</label>
                          <select
                            value={actDate}
                            onChange={e => setActDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-900/30"
                          >
                            {getStopDates(stop).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Time (Optional)</label>
                          <Input
                            type="time"
                            value={actStartTime}
                            onChange={e => setActStartTime(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Time (Optional)</label>
                          <Input
                            type="time"
                            value={actEndTime}
                            onChange={e => setActEndTime(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cost (INR)</label>
                          <Input
                            type="number"
                            min="0"
                            value={actCost}
                            onChange={e => setActCost(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location (Optional)</label>
                          <Input
                            placeholder="e.g. Louvre Palace"
                            value={actLocation}
                            onChange={e => setActLocation(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description (Optional)</label>
                          <textarea
                            placeholder="Additional details..."
                            value={actDescription}
                            onChange={e => setActDescription(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-900/30 min-h-[50px] resize-y"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-slate-850 pt-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => { setShowAddActivityStopId(null); setEditingActivityId(null); }} className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800">
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" className="text-xs font-bold">
                          {editingActivityId ? 'Save' : 'Add'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Activities Grid list */}
                  {stopActs.length === 0 ? (
                    <div className="border border-slate-900 border-dashed rounded-xl p-6 text-center text-xs text-slate-500 font-medium">
                      No activities planned for this city stop. Click "Add Activity" above!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {stopActs.map((act, actIndex) => (
                        <div key={act.id} className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:border-slate-800 transition-colors">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="flex flex-col items-center mt-0.5">
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getCategoryColor(act.category)}`}>
                                {act.category}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-100 truncate">{act.name}</h5>
                              
                              {/* Metadata tags */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400 font-medium">
                                {act.date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} className="text-indigo-400" />
                                    {act.date}
                                  </span>
                                )}
                                {act.startTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} className="text-indigo-400" />
                                    {act.startTime}{act.endTime ? ` - ${act.endTime}` : ''}
                                  </span>
                                )}
                                {act.location && (
                                  <span className="flex items-center gap-1 max-w-[150px] truncate">
                                    <MapPin size={10} className="text-indigo-400" />
                                    {act.location}
                                  </span>
                                )}
                              </div>
                              {act.description && <p className="text-[10px] text-slate-500 leading-normal mt-1 max-w-md line-clamp-1">{act.description}</p>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t border-slate-900/60 sm:border-none pt-2 sm:pt-0">
                            <span className="text-xs font-extrabold text-slate-200">
                              ₹{act.cost.toLocaleString('en-IN')}
                            </span>
                            
                            {/* Actions panel */}
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => moveActivity(stop.id, actIndex, 'up')}
                                disabled={actIndex === 0}
                                className="p-1 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button 
                                onClick={() => moveActivity(stop.id, actIndex, 'down')}
                                disabled={actIndex === stopActs.length - 1}
                                className="p-1 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown size={11} />
                              </button>
                              <button 
                                onClick={() => handleOpenEditActivity(act)}
                                className="p-1 text-slate-500 hover:text-indigo-400 cursor-pointer ml-1"
                                title="Edit Activity"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button 
                                onClick={() => handleRemoveActivity(act.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                                title="Remove Activity"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
