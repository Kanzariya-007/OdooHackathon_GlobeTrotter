import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, CalendarCheck, Landmark, Compass, DollarSign } from 'lucide-react';
import { getTrips, getPopularDestinations, deleteTrip } from '../services/tripApi';
import { Trip, Destination } from '../types/trip';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { EmptyState } from '../components/ui/EmptyState';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularDests, setPopularDests] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to fetch dashboard content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  const handleDeleteTrigger = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteTrip(id);
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete trip. Please try again.');
    }
  };

  if (isLoading) {
    return <Loading message="Loading your adventure dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Error 
          title="Dashboard unavailable" 
          message={error} 
          onRetry={loadDashboardData} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="relative z-10 max-w-xl text-left">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Welcome back!</h2>
          <p className="text-indigo-100 text-sm font-light leading-relaxed">
            Plan your next adventure. Keep track of budgets, manage activity schedules, and view complete timelines. Let's make your next trip unforgettable!
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0 self-start md:self-center">
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

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Trips */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Trips</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalTripsCount}</p>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Upcoming Trips</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{upcomingTripsCount}</p>
          </div>
        </div>

        {/* Planned Budget */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Planned Budget</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">₹{totalBudget.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs flex items-center gap-4 hover:shadow-sm transition-shadow duration-200">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Destinations</p>
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upcoming Travels</h3>
              {upcomingTripsCount > 3 && (
                <button onClick={() => navigate('/trips')} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
                  View All ({upcomingTripsCount})
                </button>
              )}
            </div>
            {upcomingPreview.length === 0 ? (
              <EmptyState
                title="No upcoming trips planned"
                description="You have no upcoming travel plans booked yet. Start planning your next adventure."
                icon={<Compass size={36} />}
                action={
                  <Button size="sm" onClick={() => navigate('/trips/create')} leftIcon={<Plus size={14} />} className="font-semibold">
                    Create Trip
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingPreview.map(trip => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onDelete={handleDeleteTrigger} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Trips list */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Trips</h3>
            {recentTrips.length === 0 ? (
              <EmptyState
                title="No recent trips"
                description="You haven't created any trips yet."
                icon={<Briefcase size={36} />}
                action={
                  <Button size="sm" onClick={() => navigate('/trips/create')} leftIcon={<Plus size={14} />} className="font-semibold">
                    Create Trip
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentTrips.map(trip => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onDelete={handleDeleteTrigger} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Popular Destinations */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Popular Destinations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {popularDests.map(dest => (
              <div key={dest.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
                <div className="h-32 overflow-hidden bg-slate-100 relative">
                  <img 
                    src={dest.image} 
                    alt={dest.city} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-xs text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                    Cost Index: {dest.costIndex}/5
                  </div>
                </div>
                <div className="p-4 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {dest.city}, <span className="font-medium text-slate-400">{dest.country}</span>
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed line-clamp-2">
                      {dest.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/trips/create', { state: { prefilledCity: dest.city, prefilledCountry: dest.country } })}
                    className="w-full mt-4 text-xs py-1.5 border border-indigo-50 hover:border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold"
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
