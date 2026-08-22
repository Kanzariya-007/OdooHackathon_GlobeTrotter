import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getTrip, updateTrip } from '../services/tripApi';
import { TripForm } from '../components/trips/TripForm';
import { Trip, TripFormData } from '../types/trip';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

export const EditTrip: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await getTrip(id);
        setTrip(fetched);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve trip details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  const handleFormSubmit = async (formData: TripFormData) => {
    if (!id || !trip) return;

    setIsUpdating(true);
    setError(null);
    try {
      // Structure the budget properly if it gets updated or falls back
      const updatedBudget = trip.budget 
        ? {
            ...trip.budget,
            totalBudget: formData.totalBudget || trip.budget.totalBudget
          }
        : undefined;

      await updateTrip(id, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        coverImage: formData.coverImage,
        budget: updatedBudget
      });

      // Redirect back to Trip Details
      navigate(`/trips/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update trip. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loading message="Retrieving trip configuration..." />;
  }

  if (error && !trip) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Error 
          title="Error Loading Trip" 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // Pre-map fields to fit TripFormData props
  const initialFormValues: Partial<TripFormData> = trip 
    ? {
        name: trip.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        description: trip.description || '',
        coverImage: trip.coverImage || '',
        totalBudget: trip.budget?.totalBudget
      }
    : {};

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      
      {/* Header and Back Button */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Trip: {trip?.name}</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Modify the duration, name, or metadata of this travel itinerary.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <TripForm
          initialData={initialFormValues}
          onSubmit={handleFormSubmit}
          submitLabel="Update Itinerary"
          isLoading={isUpdating}
        />
      </div>

    </div>
  );
};
