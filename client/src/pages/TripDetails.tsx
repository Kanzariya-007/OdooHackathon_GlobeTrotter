import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Share2, Calendar, MapPin, 
  DollarSign, Activity, ListOrdered, PiggyBank, Copy, Check, Compass,
  Trash2, AlertCircle, Plus
} from 'lucide-react';
import { getTrip, deleteTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { EmptyState } from '../components/ui/EmptyState';
import { CityDiscoveryModal } from '../components/trips/CityDiscoveryModal';
import { ActivityDiscoveryModal } from '../components/trips/ActivityDiscoveryModal';
import { ItineraryBuilder } from '../components/trips/ItineraryBuilder';
import { Timeline } from '../components/trips/Timeline';
import { BudgetDashboard } from '../components/trips/BudgetDashboard';

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

  // Discovery Modals state
  const [isCityDiscoveryOpen, setIsCityDiscoveryOpen] = useState(false);
  const [isActivityDiscoveryOpen, setIsActivityDiscoveryOpen] = useState(false);

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
    return <Loading message="Retrieving trip itinerary details..." />;
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Error 
          title="Trip Details Unavailable" 
          message={error || "Unable to display details for this trip ID."} 
          onRetry={() => window.location.reload()} 
        />
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Cities Explored</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCityDiscoveryOpen(true)}
                    leftIcon={<Plus size={12} />}
                    className="text-[10px] font-bold py-1.5"
                  >
                    Add Stop
                  </Button>
                </div>
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

        {/* ---- ITINERARY ---- */}
        {activeTab === 'itinerary' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Itinerary Builder</h3>
                <p className="text-xs text-slate-400 mt-1">Create day-by-day stops, discover local activities, and build your schedule.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCityDiscoveryOpen(true)}
                  leftIcon={<Plus size={12} />}
                  className="text-xs font-bold"
                >
                  Discover Cities
                </Button>
                {trip.destinations && trip.destinations.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsActivityDiscoveryOpen(true)}
                    leftIcon={<Plus size={12} />}
                    className="text-xs font-bold"
                  >
                    Discover & Schedule Activities
                  </Button>
                )}
              </div>
            </div>

            <ItineraryBuilder 
              trip={trip} 
              onSaveSuccess={(updatedTrip) => setTrip(updatedTrip)} 
            />
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-5 text-left">
              <h3 className="font-bold text-slate-800 text-sm">Budget Analysis Dashboard</h3>
              <p className="text-xs text-slate-400 mt-1">Allocation graphs, average expenses, and cushion monitoring.</p>
            </div>
            <BudgetDashboard trip={trip} />
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 mb-6 text-left">
              <h3 className="font-bold text-slate-800 text-sm">Visual Travel Timeline</h3>
              <p className="text-xs text-slate-400 mt-1">Detailed daily sequence order of stops, hotel check-ins, and tours.</p>
            </div>
            <Timeline 
              trip={trip} 
              onAddActivityTrigger={() => setIsActivityDiscoveryOpen(true)}
              onAddStopTrigger={() => setIsCityDiscoveryOpen(true)}
            />
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

      {trip && (
        <>
          <CityDiscoveryModal
            isOpen={isCityDiscoveryOpen}
            onClose={() => setIsCityDiscoveryOpen(false)}
            trip={trip}
            onTripUpdated={(updatedTrip) => setTrip(updatedTrip)}
          />
          <ActivityDiscoveryModal
            isOpen={isActivityDiscoveryOpen}
            onClose={() => setIsActivityDiscoveryOpen(false)}
            trip={trip}
            onTripUpdated={(updatedTrip) => setTrip(updatedTrip)}
          />
        </>
      )}

    </div>
  );
};
