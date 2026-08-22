import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, CalendarCheck, Landmark, Compass, DollarSign } from 'lucide-react';
import { getTrips, getPopularDestinations } from '../services/tripApi';
import { Trip, Destination } from '../types/trip';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularDests, setPopularDests] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTrips = await getTrips();
        setTrips(fetchedTrips);
        
        const fetchedDests = await getPopularDestinations();
        setPopularDests(fetchedDests);
      } catch (err: any) {
        console.error('Error loading dashboard data', err);
        setError('Failed to fetch dashboard content.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Stats calculation
  const totalTripsCount = trips.length;
  
  const upcomingTrips = trips.filter(t => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(t.startDate) >= today;
  });
  
  const upcomingTripsCount = upcomingTrips.length;
  
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget?.totalBudget || 0), 0);
  
  const totalDestinations = trips.reduce((acc, t) => acc + (t.destinations?.length || 0), 0);

  // Take the 3 most upcoming trips for dashboard preview
  const upcomingPreview = [...upcomingTrips]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Take the 2 most recently created/modified trips
  const recentTrips = [...trips]
    .slice(0, 2);

  const handleTripDeleteSuccess = (deletedId: string) => {
    setTrips(prev => prev.filter(t => t.id !== deletedId));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Loading your adventure dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Welcome back, Traveler!</h2>
          <p className="text-indigo-100 text-sm font-light">
            Plan your next adventure, keep track of budgets, manage activity schedules, and view complete timelines. Let's make your next trip unforgettable!
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/trips/create')}
            className="bg-white hover:bg-slate-50 text-indigo-900 font-bold border-none shadow-md shadow-indigo-950/20"
          >
            Plan New Trip
          </Button>
        </div>
        {/* Background Decorative Circles */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Trips */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Trips</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalTripsCount}</p>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Upcoming</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{upcomingTripsCount}</p>
          </div>
        </div>

        {/* Planned Budget */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Budget</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">₹{totalBudget.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Destinations</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalDestinations}</p>
          </div>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Upcoming & Recent Trips */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Upcoming Trips */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Upcoming Travels</h3>
              {upcomingTripsCount > 3 && (
                <button onClick={() => navigate('/trips')} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
                  View All ({upcomingTripsCount})
                </button>
              )}
            </div>
            {upcomingPreview.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <Compass size={36} className="text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700 mb-1">No upcoming trips planned</p>
                <p className="text-xs text-slate-400 max-w-sm mb-4">You have no upcoming travel plans booked yet. Start exploring or configure a new trip.</p>
                <Button size="sm" onClick={() => navigate('/trips/create')} leftIcon={<Plus size={14} />}>
                  Create Trip
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingPreview.map(trip => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onDelete={(id) => {
                      if (window.confirm("Are you sure you want to delete this trip?")) {
                        handleTripDeleteSuccess(id);
                      }
                    }} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Trips list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Plans</h3>
            {recentTrips.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400">
                No recent activity.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentTrips.map(trip => (
                  <div key={trip.id} className="bg-white border border-slate-100 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-200 transition-colors shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                        <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">{trip.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{trip.startDate} to {trip.endDate}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="text-xs py-1"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Popular Destinations */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Popular Destinations</h3>
          <div className="flex flex-col gap-3">
            {popularDests.map(dest => (
              <div key={dest.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col">
                <div className="h-28 overflow-hidden bg-slate-100 relative">
                  <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-indigo-600/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-md">
                    Cost Index: {dest.costIndex}/5
                  </div>
                </div>
                <div className="p-3 text-left">
                  <h4 className="font-bold text-xs text-slate-900">{dest.city}, <span className="font-medium text-slate-500">{dest.country}</span></h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                    {dest.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/trips/create', { state: { prefilledCity: dest.city, prefilledCountry: dest.country } })}
                    className="w-full mt-2.5 text-[10px] py-1 border border-indigo-50 text-indigo-600 hover:bg-indigo-50 font-semibold"
                  >
                    Plan Trip Here
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
