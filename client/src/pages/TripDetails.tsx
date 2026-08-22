import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Share2, Calendar, MapPin, 
  DollarSign, Activity, ListOrdered, PiggyBank, Copy, Check, Compass
} from 'lucide-react';
import { getTrip } from '../services/tripApi';
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

          <div className="flex gap-2 flex-shrink-0">
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

        {/* Itinerary Tab Placeholder */}
        {activeTab === 'itinerary' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-bold text-slate-800 text-sm">Itinerary Builder & Stopovers</h3>
              <p className="text-xs text-slate-400 mt-1">Configure scheduled activities, change trip orders, and list travel cities.</p>
            </div>
            
            {/* Show mock activities list from current trip */}
            {trip.activities?.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl">
                <Activity size={32} className="text-slate-300 mb-2" />
                <h4 className="font-semibold text-xs text-slate-700">No scheduled activities yet</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1 mb-4">Activities planned in the stops are scheduled here to construct your day-to-day agenda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {trip.activities?.map((act) => (
                  <div key={act.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                        {act.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 mt-1.5">{act.name}</h4>
                      {act.description && <p className="text-[10px] text-slate-400 mt-0.5">{act.description}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 self-start sm:self-auto">
                      {act.date && (
                        <span>📅 {act.date} {act.startTime ? `@ ${act.startTime}` : ''}</span>
                      )}
                      {act.duration && <span>⏱️ {act.duration}</span>}
                      <span className="font-bold text-slate-700">₹{act.cost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Note placeholder banner */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-semibold">🔧 Member 4 / 2 Placeholder: ItineraryBuilder component</p>
              <p className="text-[11px] text-slate-400 mt-1">This slot is reserved for adding cities, setting dates, adding custom activities, and ordering stops.</p>
            </div>
          </div>
        )}

        {/* Budget Tab Placeholder */}
        {activeTab === 'budget' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-bold text-slate-800 text-sm">Budget Analysis Dashboard</h3>
              <p className="text-xs text-slate-400 mt-1">Allocation graphs, average expenses, and cushion monitoring.</p>
            </div>

            {/* Expense Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
              {[
                { name: 'Transport', val: transportVal, color: 'bg-indigo-500' },
                { name: 'Accommodation', val: accommodationVal, color: 'bg-teal-500' },
                { name: 'Activities', val: activitiesVal, color: 'bg-amber-500' },
                { name: 'Food & Dining', val: foodVal, color: 'bg-rose-500' },
                { name: 'Miscellaneous', val: otherVal, color: 'bg-slate-400' }
              ].map((category) => (
                <div key={category.name} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{category.name}</span>
                  <p className="text-sm font-extrabold text-slate-800 mt-1">₹{category.val.toLocaleString('en-IN')}</p>
                  
                  {/* Visual percentage tracker bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className={`h-full ${category.color}`} 
                      style={{ width: `${totalBudgetVal > 0 ? (category.val / totalBudgetVal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Analytics Status */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center justify-between flex-wrap gap-2 mb-6">
              <div>
                <p className="font-bold">Budget Status: Within Budget Cushion 🟢</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Average daily allocation: ₹{Math.round(budgetSum / 10).toLocaleString('en-IN')} (based on 10 days)</p>
              </div>
              <span className="font-extrabold bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px]">
                Under Target by ₹{(totalBudgetVal - budgetSum).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Chart Placeholder */}
            <div className="h-44 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <PiggyBank size={24} className="mb-1" />
              <p className="text-xs font-semibold">📊 Member 4 / 2 Placeholder: Recharts Donut / Pie Breakdown</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Dynamic charts displaying category allocations will load here.</p>
            </div>
          </div>
        )}

        {/* Timeline Tab Placeholder */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Chronological Trip Timeline</h3>
              <p className="text-xs text-slate-400 mt-1">Detailed sequence order of stops, hotel check-ins, and tours.</p>
            </div>

            {/* Timeline layout display */}
            {trip.activities?.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No timeline events configured.
              </div>
            ) : (
              <div className="relative border-l border-slate-150 pl-6 ml-3 flex flex-col gap-6 text-left">
                {trip.activities?.filter(act => act.date).map((act, idx) => (
                  <div key={act.id} className="relative">
                    {/* Circle bullet */}
                    <div className="absolute -left-[31px] top-0.5 bg-white border-2 border-indigo-600 w-4.5 h-4.5 rounded-full flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    </div>

                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      📅 {act.date} {act.startTime ? `| 🕰️ ${act.startTime}` : ''}
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 mt-1">{act.name}</h4>
                    {act.description && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>}
                    
                    <span className="inline-block mt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                      {act.category} | cost: ₹{act.cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Note placeholder banner */}
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-semibold">🔧 Member 4 / 2 Placeholder: Vertical Timeline</p>
              <p className="text-[11px] text-slate-400 mt-1">Day-by-day chronological markers will render here.</p>
            </div>
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

    </div>
  );
};
