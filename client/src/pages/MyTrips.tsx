import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Compass, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTrips, deleteTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';
import { Modal } from '../components/ui/Modal';

export const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Success toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err: any) {
      console.error(err);
      setLoadError('Could not load trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleDeleteTrigger = (id: string) => {
    setTripToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return; // Prevent closing while delete in flight
    setDeleteModalOpen(false);
    setTripToDelete(null);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete || isDeleting) return; // Guard against duplicate clicks

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteTrip(tripToDelete);
      setTrips(prev => prev.filter(t => t.id !== tripToDelete));
      setDeleteModalOpen(false);
      setTripToDelete(null);
      showSuccess('Trip deleted successfully.');
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || 'Failed to delete trip. Please try again.');
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
        <p className="text-sm font-medium text-slate-500">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">My Trips</h1>
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

      {/* Load Error */}
      {loadError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="font-semibold">{loadError}</span>
          <button
            className="ml-auto text-xs text-red-500 underline hover:text-red-700"
            onClick={loadTrips}
          >
            Retry
          </button>
        </div>
      )}

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 mb-4">
            <Compass size={40} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No trips yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            You haven't planned any trips yet. Start building your first itinerary now!
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
        onClose={handleDeleteCancel}
        title="Delete this trip?"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteCancel}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
              className="font-semibold"
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 text-sm">This action cannot be undone.</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                This will permanently delete the trip, including all destinations, activities, and budget plans.
              </p>
            </div>
          </div>
          {/* Inline delete error (no alert()) */}
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={14} />
              {deleteError}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};
