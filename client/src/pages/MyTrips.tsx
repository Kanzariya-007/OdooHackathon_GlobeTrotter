import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Compass, AlertCircle } from 'lucide-react';
import { getTrips, deleteTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { EmptyState } from '../components/ui/EmptyState';

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
    return <Loading message="Retrieving your travel itineraries..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Error 
          title="Failed to load trips" 
          message={error} 
          onRetry={loadTrips} 
        />
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

      {/* Trips Grid list */}
      {trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Start planning your next adventure."
          icon={<Compass size={40} className="animate-spin-slow" />}
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
