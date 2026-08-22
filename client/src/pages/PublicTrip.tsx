import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip, createTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { 
  Compass, Calendar, MapPin, Copy, Check, ArrowRight, 
  ListOrdered, PiggyBank 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Timeline } from '../components/trips/Timeline';
import { BudgetDashboard } from '../components/trips/BudgetDashboard';
import { useToast } from '../context/ToastContext';

export const PublicTrip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'budget'>('overview');

  useEffect(() => {
    const fetchSharedTrip = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await getTrip(id);
        setTrip(fetched);
      } catch (err: any) {
        console.error(err);
        setError('Shared itinerary not found or invalid link.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedTrip();
  }, [id]);

  const handleCopyTrip = async () => {
    if (!trip) return;
    
    // Check if token exists in localStorage (representing active user)
    const token = localStorage.getItem('globetrotter_token');
    if (!token) {
      localStorage.setItem('pending_copy_trip_id', trip.id);
      showToast('Please log in to copy this trip.', 'info');
      navigate('/login');
      return;
    }

    setIsCopying(true);
    try {
      // Create duplicate trip
      const copiedTrip = await createTrip({
        name: `${trip.name} — Copy`,
        startDate: trip.startDate,
        endDate: trip.endDate,
        description: trip.description || '',
        coverImage: trip.coverImage || '',
        totalBudget: trip.budget?.totalBudget || 50000
      });

      // Update mock copy destinations/activities/tripStops to keep data intact
      const { updateTrip } = await import('../services/tripApi');
      await updateTrip(copiedTrip.id, {
        destinations: trip.destinations,
        activities: trip.activities,
        tripStops: trip.tripStops
      });

      showToast('Trip copied successfully.', 'success');
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        navigate(`/trips/${copiedTrip.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('Failed to clone trip itinerary.', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  // Auto-execute copy on mount/refresh if authenticated and copy was pending
  useEffect(() => {
    if (trip) {
      const pendingId = localStorage.getItem('pending_copy_trip_id');
      const token = localStorage.getItem('globetrotter_token');
      if (pendingId === trip.id && token) {
        localStorage.removeItem('pending_copy_trip_id');
        handleCopyTrip();
      }
    }
  }, [trip]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Retrieving shared trip itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center gap-4">
        <MapPin size={40} className="text-slate-350" />
        <h3 className="font-bold text-slate-800 text-base">Trip not found</h3>
        <p className="text-xs text-slate-400 max-w-sm">Unable to load shared trip. The link may be invalid or has expired.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
          Go to GlobeTrotter Login
        </Button>
      </div>
    );
  }

  const defaultCover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  const coverUrl = trip.coverImage && trip.coverImage.trim() !== '' ? trip.coverImage : defaultCover;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 flex flex-col items-center">
      
      {/* Mini Brand Banner */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-35">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/login')}>
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Compass size={16} />
          </div>
          <span className="font-bold text-sm text-slate-900">GlobeTrotter</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="text-xs font-semibold">
          Sign In <ArrowRight size={12} className="ml-1" />
        </Button>
      </header>
 
      {/* Main Container */}
      <div className="w-full max-w-4xl px-4 sm:px-6 flex flex-col gap-6 mt-6">
        
        {/* Cover Photo & Main Title Block */}
        <div className="relative rounded-2xl overflow-hidden shadow-md bg-slate-950 border border-slate-100">
          <div className="h-64 sm:h-72 w-full overflow-hidden relative">
            <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
 
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5 text-left">
            <div className="text-white">
              <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded-md">
                SHARED PUBLIC ITINERARY
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight">
                {trip.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-200">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-indigo-400" />
                  {trip.startDate} to {trip.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-indigo-400" />
                  {trip.destinations?.length || 0} destinations
                </span>
              </div>
            </div>
 
            <Button
              variant="primary"
              size="md"
              isLoading={isCopying}
              onClick={handleCopyTrip}
              leftIcon={copySuccess ? <Check size={16} /> : <Copy size={16} />}
              className="bg-white hover:bg-slate-100 text-slate-900 border-none font-bold text-xs"
            >
              {copySuccess ? 'Copied!' : 'Copy This Trip'}
            </Button>
          </div>
        </div>

        {/* Tabs Menu */}
        <div className="flex border-b border-slate-200 gap-6 w-full mt-4 justify-start">
          {[
            { id: 'overview', name: 'Overview', icon: <Compass size={15} /> },
            { id: 'timeline', name: 'Timeline View', icon: <ListOrdered size={15} /> },
            { id: 'budget', name: 'Budget Summary', icon: <PiggyBank size={15} /> },
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
        <div className="w-full mt-2">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              {/* Description Card */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs text-left">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Trip Description</h3>
                  <p className="text-xs text-slate-550 leading-relaxed whitespace-pre-line">
                    {trip.description || "No description provided."}
                  </p>
                </div>

                {/* Planned Stops */}
                {trip.destinations?.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs text-left">
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Planned Stops</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {trip.destinations.map(dest => (
                        <div key={dest.id} className="flex items-center gap-3 border border-slate-50 rounded-lg p-2.5 bg-slate-50/50">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                            <img src={dest.image || defaultCover} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{dest.city}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{dest.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar info */}
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs text-left">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Info</h3>
                  <div className="flex flex-col gap-3 text-xs text-slate-650">
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Total Budget Target</span>
                      <span className="font-bold text-slate-800">₹{(trip.budget?.totalBudget || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span className="text-slate-400">Duration</span>
                      <span className="font-bold text-slate-800">
                        {Math.ceil(Math.abs(new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200 text-left">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-bold text-slate-800 text-sm">Visual Travel Timeline</h3>
                <p className="text-xs text-slate-400 mt-1">Detailed daily sequence order of stops, hotel check-ins, and tours.</p>
              </div>
              <Timeline trip={trip} />
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs animate-in fade-in duration-200 text-left">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="font-bold text-slate-800 text-sm">Budget Analysis Dashboard</h3>
                <p className="text-xs text-slate-400 mt-1">Allocation graphs, average expenses, and cushion monitoring.</p>
              </div>
              <BudgetDashboard trip={trip} />
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
