import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getTrip, updateTrip } from '../services/tripApi';
import { TripForm } from '../components/trips/TripForm';
import { Trip, TripFormData } from '../types/trip';
import { Button } from '../components/ui/Button';

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
      const updatedBudget = trip.budget
        ? { ...trip.budget, totalBudget: formData.totalBudget ?? trip.budget.totalBudget }
        : undefined;

      await updateTrip(id, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        coverImage: formData.coverImage,
        ...(updatedBudget && { budget: updatedBudget }),
      });

      navigate(`/trips/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update trip. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Loading trip data...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <h3 className="font-bold text-slate-800 text-base">Trip Not Found</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{error || 'Could not find the trip you are trying to edit.'}</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/trips')}>
          Back to My Trips
        </Button>
      </div>
    );
  }

  const initialFormValues: Partial<TripFormData> = {
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    description: trip.description || '',
    coverImage: trip.coverImage || '',
    totalBudget: trip.budget?.totalBudget ?? 50000,
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/trips/${id}`)}
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Trip</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-xs">{trip.name}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <TripForm
          initialData={initialFormValues}
          onSubmit={handleFormSubmit}
          onCancel={() => navigate(`/trips/${id}`)}
          submitLabel="Save Changes"
          isLoading={isUpdating}
        />
      </div>

    </div>
  );
};
