import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Share2, Calendar, MapPin, 
  DollarSign, Activity, ListOrdered, PiggyBank, Copy, Check, Compass,
  Trash2, AlertCircle, Sun, SunDim, Moon, ArrowDown
} from 'lucide-react';
import { getTrip, deleteTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const TripDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'timeline'>('overview');

  useEffect(() => {
    const loadTripDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrip(id);
        setTrip(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Trip not found or API endpoint error.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTripDetails();
  }, [id]);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Helper to generate local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTripDays = () => {
    if (!trip) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = [];
    const current = new Date(start);
    
    let maxDays = 100;
    while (current <= end && maxDays > 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      maxDays--;
    }
    return days;
  };

  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getHour = (timeStr?: string) => {
    if (!timeStr) return -1;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0], 10);
    return isNaN(h) ? -1 : h;
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteTrip(id);
      setDeleteModalOpen(false);
      navigate('/trips');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Retrieving trip itinerary details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center gap-4">
        <MapPin size={40} className="text-slate-300" />
        <h3 className="font-bold text-slate-800 text-base">Trip Details Unavailable</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{error || "Unable to display details for this trip ID."}</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Safe fallback cover image
  const defaultCover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  const coverUrl = trip.coverImage && trip.coverImage.trim() !== '' ? trip.coverImage : defaultCover;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const totalBudgetVal = trip.budget?.totalBudget ?? 0;
  const transportVal = trip.budget?.transport ?? 0;
  const accommodationVal = trip.budget?.accommodation ?? 0;
  const activitiesVal = trip.budget?.activities ?? 0;
  const foodVal = trip.budget?.food ?? 0;
  const otherVal = trip.budget?.other ?? 0;
  const budgetSum = transportVal + accommodationVal + activitiesVal + foodVal + otherVal;

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Back Button and Banner Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-950">
        
        {/* Cover Background */}
        <div className="h-64 sm:h-72 w-full overflow-hidden relative">
          <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Back Link float */}
        <button
          onClick={() => navigate('/trips')}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg transition-colors border border-white/10"
          title="Back to trips"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Text Details & Action Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-white">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded-md">
              ITINERARY
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight" title={trip.name}>
              {trip.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-200">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-indigo-400" />
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-indigo-400" />
                {trip.destinations?.length || 0} destinations
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <DollarSign size={13} />
                ₹{totalBudgetVal.toLocaleString('en-IN')} Target
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareClick}
              leftIcon={<Share2 size={14} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              Share Trip
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/trips/${id}/edit`)}
              leftIcon={<Edit2 size={14} />}
              className="text-xs"
            >
              Edit Trip
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              leftIcon={<Trash2 size={14} />}
              className="text-xs"
            >
              Delete Trip
            </Button>
          </div>
        </div>

      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: 'overview', name: 'Overview', icon: <Compass size={15} /> },
          { id: 'itinerary', name: 'Itinerary Builder', icon: <Activity size={15} /> },
          { id: 'budget', name: 'Budget Analyzer', icon: <PiggyBank size={15} /> },
          { id: 'timeline', name: 'Timeline view', icon: <ListOrdered size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[30vh]">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Description Card */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3">About This Journey</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                  {trip.description || "No travel notes or description configured yet. Edit your trip to add goals, accommodation notes, flight details, or bucket list points here."}
                </p>
              </div>

              {/* Destinations visited */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Cities Explored</h3>
                {trip.destinations?.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No cities added to this trip stops yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {trip.destinations?.map((dest) => (
                      <div key={dest.id} className="flex items-center gap-3 border border-slate-50 rounded-lg p-2.5 bg-slate-50/50">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                          <img src={dest.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-xs text-slate-800">{dest.city}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{dest.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats sidebar */}
            <div className="flex flex-col gap-4">
              {/* Budget Quick Summary */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Budget Summary</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-xs text-slate-400">Total Target Budget</span>
                    <span className="text-sm font-bold text-slate-850">₹{totalBudgetVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="text-xs text-slate-400">Allocated Expenses</span>
                    <span className="text-sm font-bold text-indigo-600">₹{budgetSum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Remaining Cushion</span>
                    <span className={`text-sm font-bold ${totalBudgetVal - budgetSum >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      ₹{(totalBudgetVal - budgetSum).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips list count */}
              <div className="bg-indigo-900/5 border border-indigo-100 rounded-xl p-4.5">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1.5">Note for Member 2 & 4</h4>
                <p className="text-[11px] text-indigo-700/80 leading-normal">
                  The tabs below contain basic placeholder interfaces. Feel free to integrate dynamic controls (City Discovery, Activity scheduling, Recharts donut rendering, vertical timeline items) directly into the Itinerary, Budget, or Timeline structures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-bold text-slate-800 text-sm">Trip Itinerary</h3>
              <p className="text-xs text-slate-400 mt-1">Day-by-day scheduled activities and locations for your journey.</p>
            </div>
            
            {!trip.activities || trip.activities.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl">
                <Activity size={32} className="text-slate-300 mb-2" />
                <h4 className="font-semibold text-xs text-slate-700">No scheduled activities yet</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">Activities planned in the stops will be scheduled here to construct your day-to-day agenda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {getTripDays().map((dayDate, index) => {
                  const dateStr = getLocalDateString(dayDate);
                  const dayActivities = (trip.activities || []).filter(act => act.date === dateStr);
                  
                  return (
                    <div key={dateStr} className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                      {/* Day Header */}
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Day {index + 1}</span>
                          <h4 className="font-bold text-sm text-slate-800 mt-0.5">{formatDayDate(dayDate)}</h4>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                        </span>
                      </div>

                      {/* Day Activities List */}
                      <div className="p-4 flex flex-col gap-3">
                        {dayActivities.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-left py-2">No activities scheduled for this day. Rest or explore at your own pace!</p>
                        ) : (
                          dayActivities.map((act) => (
                            <div key={act.id} className="border border-slate-50 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                              <div className="flex items-start gap-3">
                                {/* Bullet category indicator */}
                                <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-xs text-slate-800">{act.name}</h5>
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                                      {act.category}
                                    </span>
                                  </div>
                                  
                                  {act.location && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                                      <MapPin size={12} className="text-slate-400" />
                                      <span>{act.location}</span>
                                    </div>
                                  )}
                                  
                                  {act.description && (
                                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{act.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 self-start sm:self-auto sm:text-right pl-5 sm:pl-0">
                                {act.startTime && (
                                  <span className="font-semibold text-slate-600">
                                    ⏱️ {act.startTime} {act.endTime ? ` - ${act.endTime}` : ''}
                                  </span>
                                )}
                                {act.duration && (
                                  <span className="text-[11px] text-slate-400">({act.duration})</span>
                                )}
                                <span className="font-bold text-slate-700 text-sm">₹{act.cost.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-bold text-slate-800 text-sm">Budget Analysis Dashboard</h3>
              <p className="text-xs text-slate-400 mt-1">Allocation graphs, average expenses, and cushion monitoring.</p>
            </div>

            {!trip.budget || totalBudgetVal === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl">
                <PiggyBank size={32} className="text-slate-300 mb-2" />
                <h4 className="font-semibold text-xs text-slate-700">No budget data available</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">You haven't configured a budget for this trip. Edit the trip to set your target budget.</p>
              </div>
            ) : (
              <div>
                {/* Total Budget Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Estimated Budget</span>
                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalBudgetVal.toLocaleString('en-IN')}</h4>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 min-w-[120px]">
                      <span className="text-[9px] font-semibold text-indigo-400 uppercase">Allocated</span>
                      <p className="text-sm font-bold text-indigo-700 mt-0.5">₹{budgetSum.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`${totalBudgetVal - budgetSum >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} border rounded-lg p-2.5 min-w-[120px]`}>
                      <span className={`text-[9px] font-semibold ${totalBudgetVal - budgetSum >= 0 ? 'text-emerald-400' : 'text-red-400'} uppercase`}>Remaining</span>
                      <p className={`text-sm font-bold ${totalBudgetVal - budgetSum >= 0 ? 'text-emerald-700' : 'text-red-700'} mt-0.5`}>
                        ₹{(totalBudgetVal - budgetSum).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar categories */}
                <div className="flex flex-col gap-4 text-left mb-6">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Category Allocation Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Transport', val: transportVal, barColor: 'bg-indigo-600' },
                      { name: 'Accommodation', val: accommodationVal, barColor: 'bg-teal-600' },
                      { name: 'Food', val: foodVal, barColor: 'bg-rose-600' },
                      { name: 'Activities', val: activitiesVal, barColor: 'bg-amber-600' },
                      { name: 'Other', val: otherVal, barColor: 'bg-slate-500' }
                    ].map((category) => {
                      const pct = totalBudgetVal > 0 ? (category.val / totalBudgetVal) * 100 : 0;
                      return (
                        <div key={category.name} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-800">{category.name}</span>
                            <span className="text-xs font-semibold text-slate-500">
                              ₹{category.val.toLocaleString('en-IN')} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          
                          {/* Visual percentage tracker bar */}
                          <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${category.barColor} transition-all duration-500`} 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall Allocation Gauge */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 text-left">
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-semibold text-slate-500">Overall Budget Allocation</span>
                    <span className={`font-bold ${budgetSum <= totalBudgetVal ? 'text-indigo-600' : 'text-red-500'}`}>
                      {((budgetSum / totalBudgetVal) * 100).toFixed(1)}% Allocated
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${budgetSum <= totalBudgetVal ? 'bg-indigo-600' : 'bg-red-500'} transition-all duration-500`}
                      style={{ width: `${Math.min((budgetSum / totalBudgetVal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {budgetSum <= totalBudgetVal 
                      ? "🟢 Your allocated expenses are currently within the target budget limit."
                      : "⚠️ Your allocated expenses exceed the estimated target budget limit."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Visual Travel Timeline</h3>
              <p className="text-xs text-slate-400 mt-1">Detailed daily sequence order of stops, hotel check-ins, and tours.</p>
            </div>

            {!trip.activities || trip.activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No timeline events configured.
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {getTripDays().map((dayDate, index) => {
                  const dateStr = getLocalDateString(dayDate);
                  const dayActivities = (trip.activities || []).filter(act => act.date === dateStr);
                  
                  const morningItems = dayActivities.filter(a => {
                    const h = getHour(a.startTime);
                    return h >= 0 && h < 12;
                  });
                  const afternoonItems = dayActivities.filter(a => {
                    const h = getHour(a.startTime);
                    return h >= 12 && h < 17;
                  });
                  const eveningItems = dayActivities.filter(a => {
                    const h = getHour(a.startTime);
                    return h >= 17;
                  });
                  const unscheduledItems = dayActivities.filter(a => {
                    const h = getHour(a.startTime);
                    return h === -1;
                  });

                  const slots = [
                    { title: 'Morning', icon: <Sun className="text-amber-500 flex-shrink-0" size={16} />, items: morningItems },
                    { title: 'Afternoon', icon: <SunDim className="text-orange-500 flex-shrink-0" size={16} />, items: afternoonItems },
                    { title: 'Evening', icon: <Moon className="text-indigo-400 flex-shrink-0" size={16} />, items: eveningItems },
                    { title: 'Scheduled', icon: <Calendar className="text-slate-400 flex-shrink-0" size={16} />, items: unscheduledItems }
                  ].filter(s => s.items.length > 0);

                  return (
                    <div key={dateStr} className="flex flex-col gap-3">
                      {/* Day Title Node */}
                      <div className="flex flex-col items-center">
                        <div className="bg-indigo-600 text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-md shadow-indigo-150">
                          Day {index + 1}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 mt-1">{formatDayDate(dayDate)}</p>
                      </div>

                      {slots.length === 0 ? (
                        <div className="flex flex-col items-center">
                          <ArrowDown size={14} className="text-slate-300 my-1" />
                          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2 max-w-sm">
                            <Compass size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">Rest Day — Relax and explore</span>
                          </div>
                        </div>
                      ) : (
                        slots.map((slot) => (
                          <React.Fragment key={slot.title}>
                            {/* Down Arrow separator before each slot */}
                            <div className="flex flex-col items-center animate-in fade-in duration-200">
                              <ArrowDown size={14} className="text-indigo-400 my-1" />
                            </div>

                            {/* Slot Node */}
                            <div className="flex flex-col items-center max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
                              <div className="bg-white border border-slate-100 rounded-xl shadow-xs p-3.5 w-full hover:border-slate-200 transition-colors text-left flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                  {slot.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{slot.title}</span>
                                  <div className="flex flex-col gap-2.5 mt-1.5">
                                    {slot.items.map(act => (
                                      <div key={act.id} className="border-l-2 border-indigo-500 pl-2.5 text-left">
                                        <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{act.name}</h5>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                                          {act.startTime && (
                                            <span>⏱️ {act.startTime} {act.endTime ? ` - ${act.endTime}` : ''}</span>
                                          )}
                                          {act.location && (
                                            <span>📍 {act.location}</span>
                                          )}
                                          <span className="text-slate-500 font-bold">₹{act.cost.toLocaleString('en-IN')}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Share Trip Link Generation Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Your Trip"
        size="sm"
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareModalOpen(false)}
            className="text-xs font-semibold"
          >
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xs text-slate-400 leading-normal">
            Generate a public web link for your itinerary. Anyone with this link can view your destinations, schedule timeline, and budget allocations without needing to sign in.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/share/${id}`}
              className="flex-1 text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-500 font-mono outline-none"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={copyShareLink}
              leftIcon={copiedLink ? <Check size={14} /> : <Copy size={14} />}
              className="px-4 font-semibold text-xs"
            >
              {copiedLink ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Confirm Trip Deletion"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
              className="text-xs font-semibold"
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="font-bold text-slate-800 text-sm">Are you absolutely sure?</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              This action will permanently delete this trip, including all mapped destinations, scheduled activities, and budget plans. This cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
};
