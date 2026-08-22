import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrip, createTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Compass, Calendar, MapPin, DollarSign, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PublicTrip: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      alert('Please log in or sign up to copy this itinerary to your account.');
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

      // Update mock copy destinations/activities to keep data intact
      const { updateTrip } = await import('../services/tripApi');
      await updateTrip(copiedTrip.id, {
        destinations: trip.destinations,
        activities: trip.activities
      });

      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        navigate('/trips');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to clone trip itinerary.');
    } finally {
      setIsCopying(false);
    }
  };

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
        <MapPin size={40} className="text-slate-300" />
        <h3 className="font-bold text-slate-800 text-base">Itinerary Not Found</h3>
        <p className="text-xs text-slate-400 max-w-sm">{error || "This shared link appears to be invalid or has expired."}</p>
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
      <div className="w-full max-w-4xl px-4 sm:px-6 flex flex-col gap-6 mt-6 text-left">
        
        {/* Cover Photo & Main Title Block */}
        <div className="relative rounded-2xl overflow-hidden shadow-md bg-slate-950 border border-slate-100">
          <div className="h-64 sm:h-72 w-full overflow-hidden relative">
            <img src={coverUrl} alt="" className="w-full h-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
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
              {copySuccess ? 'Cloned successfully!' : 'Copy This Trip'}
            </Button>
          </div>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main: Description, Destinations & activities */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Notes */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-2.5">Trip Description</h3>
              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
                {trip.description || "No description provided."}
              </p>
            </div>

            {/* Destinations stops */}
            {trip.destinations?.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
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

            {/* Chronological Activities Timeline */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Itinerary Activities</h3>
              {trip.activities?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No activities scheduled.</p>
              ) : (
                <div className="relative border-l border-slate-150 pl-5 ml-2.5 flex flex-col gap-5.5">
                  {trip.activities.map((act) => (
                    <div key={act.id} className="relative">
                      {/* Timeline circle */}
                      <div className="absolute -left-[28px] top-0.5 bg-white border border-indigo-600 w-3.5 h-3.5 rounded-full flex items-center justify-center z-10">
                        <div className="w-1 h-1 bg-indigo-600 rounded-full" />
                      </div>
                      
                      <p className="text-slate-400 text-[10px] font-bold">
                        📅 {act.date} {act.startTime ? `| 🕰️ ${act.startTime}` : ''}
                      </p>
                      <h4 className="font-bold text-xs text-slate-850 mt-1">{act.name}</h4>
                      {act.description && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{act.description}</p>}
                      <span className="inline-block mt-1 text-[9px] font-semibold text-indigo-500 uppercase tracking-widest">
                        {act.category} | cost: ₹{act.cost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar: Budget Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs sticky top-22">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Budget Details</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <span className="text-xs text-slate-400">Total Planned Budget</span>
                  <span className="text-sm font-bold text-slate-800">
                    ₹{(trip.budget?.totalBudget || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                
                {/* Category bars */}
                <div className="flex flex-col gap-2 mt-1">
                  {[
                    { name: 'Transport', val: trip.budget?.transport || 0, color: 'bg-indigo-500' },
                    { name: 'Accommodation', val: trip.budget?.accommodation || 0, color: 'bg-teal-500' },
                    { name: 'Activities', val: trip.budget?.activities || 0, color: 'bg-amber-500' },
                    { name: 'Food', val: trip.budget?.food || 0, color: 'bg-rose-500' },
                    { name: 'Other', val: trip.budget?.other || 0, color: 'bg-slate-400' }
                  ].map(cat => (
                    <div key={cat.name} className="text-left">
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                        <span>{cat.name}</span>
                        <span className="text-slate-600">₹{cat.val.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${cat.color}`} 
                          style={{ width: `${(trip.budget?.totalBudget || 1) > 0 ? (cat.val / (trip.budget?.totalBudget || 1)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
