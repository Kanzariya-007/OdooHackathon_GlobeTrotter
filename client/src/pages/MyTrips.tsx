import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Compass, AlertCircle } from 'lucide-react';
import { getTrips, deleteTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';
import { Modal } from '../components/ui/Modal';

export const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDeleteTrigger = (id: string) => {
    setTripToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTrip(tripToDelete);
      setTrips(prev => prev.filter(t => t.id !== tripToDelete));
      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Retrieving your travel itineraries...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">My Trips</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and explore all your planned travel itineraries.</p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/trips/create')}
          className="font-bold self-start sm:self-auto"
        >
          Create Trip
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Trips Grid list */}
      {trips.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-4">
            <Compass size={40} className="animate-spin-slow" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No trips found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            You haven't planned any trips yet! Start structuring your travel bucket list by building your very first itinerary now.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/trips/create')}
            leftIcon={<Plus size={16} />}
            className="font-semibold"
          >
            Plan Your First Trip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={handleDeleteTrigger}
            />
          ))}
        </div>
      )}

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

    </div>
  );
};
