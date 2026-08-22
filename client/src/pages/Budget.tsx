import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Compass, Plus, Info } from 'lucide-react';
import { getTrips } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { EmptyState } from '../components/ui/EmptyState';
import { BudgetDashboard } from '../components/trips/BudgetDashboard';
import { Button } from '../components/ui/Button';

export const Budget: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTripsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]); // Select the first trip by default
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve user trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsData();
  }, []);

  if (isLoading) {
    return <Loading message="Loading budget charts..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Error 
          title="Budget Data Unavailable" 
          message={error} 
          onRetry={fetchTripsData} 
        />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <PageContainer title="Budget & Expenses" subtitle="Monitor your tour costs and logs.">
        <EmptyState
          title="No trips found"
          description="Create a trip configuration first to view budget graphs and allocated costs."
          icon={<Compass size={40} />}
          action={
            <Button
              variant="primary"
              onClick={() => navigate('/trips/create')}
              leftIcon={<Plus size={16} />}
              className="font-semibold"
            >
              Create Trip
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Budget & Expenses" subtitle="Monitor your tour costs, budget limit parameters, and itemized logs.">
      <div className="flex flex-col gap-6">
        
        {/* Selector Header Bar */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Trip to Analyze</label>
            <select
              value={selectedTrip?.id || ''}
              onChange={e => {
                const found = trips.find(t => t.id === e.target.value);
                if (found) setSelectedTrip(found);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-150 min-w-[240px] cursor-pointer"
            >
              {trips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.name} ({trip.startDate} to {trip.endDate})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-150/60 p-3 max-w-sm text-slate-550 text-xs leading-normal">
            <Info size={14} className="shrink-0 text-indigo-500" />
            <span>Allocated costs are calculated dynamically from transport, lodging, food, and activities scheduled in the itinerary.</span>
          </div>
        </div>

        {/* Budget Dashboard component */}
        {selectedTrip && (
          <BudgetDashboard trip={selectedTrip} />
        )}

      </div>
    </PageContainer>
  );
};

export default Budget;
