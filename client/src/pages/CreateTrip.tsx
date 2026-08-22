import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass, AlertCircle } from 'lucide-react';
import { createTrip } from '../services/tripApi';
import { TripForm } from '../components/trips/TripForm';
import { TripFormData } from '../types/trip';
import { Button } from '../components/ui/Button';

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a destination was prefilled from the Dashboard "Plan Trip Here" CTA
  const state = location.state as { prefilledCity?: string; prefilledCountry?: string } | null;
  
  const initialFormValues: Partial<TripFormData> = {
    name: state?.prefilledCity ? `Journey to ${state.prefilledCity}` : '',
    description: state?.prefilledCity ? `Exploring ${state.prefilledCity}, ${state.prefilledCountry}.` : '',
    coverImage: '',
    totalBudget: 60000
  };

  const handleFormSubmit = async (formData: TripFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await createTrip(formData);
      
      // If prefilled city exists, update the trip destinations locally (to support rich mocked views)
      if (state?.prefilledCity) {
        // We can update the trip's destination array
        const defaultDestImg = state.prefilledCity === 'Paris' 
          ? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
          : state.prefilledCity === 'Tokyo'
          ? 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80'
          : state.prefilledCity === 'Rome'
          ? 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

        const updatedDest = [{
          id: 'dest-' + Math.random().toString(36).substr(2, 9),
          city: state.prefilledCity,
          country: state.prefilledCountry || '',
          image: defaultDestImg
        }];
        
        // Wait, the createTrip mock generates the trip and adds it to storage. 
        // We can update it with destination to keep the flow realistic
        const { updateTrip } = await import('../services/tripApi');
        await updateTrip(created.id, { destinations: updatedDest });
      }

      // Navigate to details page of the newly created trip
      navigate(`/trips/${created.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Plan a New Adventure</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Let's start by configuring the core parameters of your trip.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
        
        {state?.prefilledCity && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs flex items-center gap-2">
            <Compass size={14} className="animate-spin-slow" />
            <span>Prefilling planning details for <strong>{state.prefilledCity}, {state.prefilledCountry}</strong></span>
          </div>
        )}

        <TripForm
          initialData={initialFormValues}
          onSubmit={handleFormSubmit}
          submitLabel="Create Itinerary"
          isLoading={isLoading}
        />
      </div>

    </div>
  );
};
