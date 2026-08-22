import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Share2, Calendar, MapPin,
  DollarSign, Activity, ListOrdered, PiggyBank, Copy, Check,
  Compass, Trash2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { getTrip, deleteTrip } from '../services/tripApi';
import { Trip } from '../types/trip';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const TripDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Share state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Success toast
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'timeline'>('overview');

  useEffect(() => {
    const loadTripDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrip(id);
        setTrip(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Trip not found or could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTripDetails();
  }, [id]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // --- Share with Clipboard API + fallback ---
  const shareUrl = `${window.location.origin}/trips/${id}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback: select text from temp textarea
        const el = document.createElement('textarea');
        el.value = shareUrl;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedLink(true);
      showSuccess('Trip link copied!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Clipboard write failed', err);
      alert(`Copy this link manually:\n\n${shareUrl}`);
    }
  };

  // --- Delete from Details page ---
  const handleDeleteConfirm = async () => {
    if (!id || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteTrip(id);
      setIsDeleteModalOpen(false);
      navigate('/trips', { state: { deleted: true } });
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || 'Failed to delete. Please try again.');
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
        <p className="text-sm font-medium text-slate-500">Loading trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center gap-4">
        <MapPin size={40} className="text-slate-300" />
        <h3 className="font-bold text-slate-800 text-base">Trip Details Unavailable</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{error || 'Unable to display details for this trip.'}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Go Back</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/trips')}>My Trips</Button>
        </div>
      </div>
    );
  }

  const defaultCover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  const coverUrl = trip.coverImage?.trim() || defaultCover;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const totalBudgetVal = trip.budget?.totalBudget ?? 0;
  const budgetSum = (trip.budget?.transport ?? 0) + (trip.budget?.accommodation ?? 0) +
    (trip.budget?.activities ?? 0) + (trip.budget?.food ?? 0) + (trip.budget?.other ?? 0);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Compass size={15} /> },
    { id: 'itinerary', name: 'Itinerary', icon: <Activity size={15} /> },
    { id: 'budget', name: 'Budget', icon: <PiggyBank size={15} /> },
    { id: 'timeline', name: 'Timeline', icon: <ListOrdered size={15} /> },
  ] as const;

  return (
    <div className="flex flex-col gap-6 text-left">

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Cover Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-950">
        <div className="h-56 sm:h-72 w-full overflow-hidden relative">
          <img src={coverUrl} alt={trip.name} className="w-full h-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/trips')}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg transition-colors border border-white/10"
          title="Back to My Trips"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Details overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-white min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded-md">
              ITINERARY
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight truncate" title={trip.name}>
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-200">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-indigo-400" />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-indigo-400" />
                {trip.destinations?.length ?? 0} destination{trip.destinations?.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <DollarSign size={13} />
                ₹{totalBudgetVal.toLocaleString('en-IN')} budget
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              leftIcon={<Share2 size={14} />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              Share
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/trips/${id}/edit`)}
              leftIcon={<Edit2 size={14} />}
              className="text-xs"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => { setDeleteError(null); setIsDeleteModalOpen(true); }}
              leftIcon={<Trash2 size={14} />}
              className="text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[30vh]">

        {/* ---- OVERVIEW ---- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Description */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3">About This Journey</h3>
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                  {trip.description || 'No description added yet. Edit the trip to add notes, goals, or details.'}
                </p>
              </div>

              {/* Destinations */}
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Cities & Destinations</h3>
                {(!trip.destinations || trip.destinations.length === 0) ? (
                  <p className="text-sm text-slate-400 text-center py-4">No destinations added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trip.destinations.map((dest) => (
                      <div key={dest.id} className="flex items-center gap-3 border border-slate-50 rounded-lg p-2.5 bg-slate-50/50">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                          <img
                            src={dest.image || defaultCover}
                            alt={dest.city}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = defaultCover; }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{dest.city}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{dest.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Quick stats */}
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Budget Overview</h3>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Target Budget</span>
                    <span className="font-bold text-slate-800">₹{totalBudgetVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">Allocated</span>
                    <span className="font-bold text-indigo-600">₹{budgetSum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining</span>
                    <span className={`font-bold ${totalBudgetVal - budgetSum >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      ₹{(totalBudgetVal - budgetSum).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-800 mb-1">For Member 4 / 2</p>
                <p className="text-xs text-indigo-700/80 leading-relaxed">
                  City discovery, activity scheduling, Recharts budget charts, and full timeline will be built in the Itinerary, Budget, and Timeline tabs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---- ITINERARY ---- */}
        {activeTab === 'itinerary' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-bold text-slate-800 text-sm">Itinerary Builder</h3>
              <p className="text-xs text-slate-400 mt-1">Add cities, schedule activities, and order your stops.</p>
            </div>
            {(!trip.activities || trip.activities.length === 0) ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-3">
                <Activity size={32} className="text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No activities scheduled yet</p>
                <p className="text-xs text-slate-400 max-w-xs">Activities added by Member 4 will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {trip.activities.map((act) => (
                  <div key={act.id} className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                        {act.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 mt-1.5">{act.name}</h4>
                      {act.description && <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                      {act.date && <span>📅 {act.date}{act.startTime ? ` @ ${act.startTime}` : ''}</span>}
                      {act.duration && <span>⏱️ {act.duration}</span>}
                      <span className="font-bold text-slate-700">₹{act.cost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
              <p className="text-xs text-slate-400 font-medium">🔧 Placeholder — Member 4: ItineraryBuilder component goes here</p>
            </div>
          </div>
        )}

        {/* ---- BUDGET ---- */}
        {activeTab === 'budget' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-bold text-slate-800 text-sm">Budget Analysis</h3>
              <p className="text-xs text-slate-400 mt-1">Track spending allocation by category.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {[
                { name: 'Transport', val: trip.budget?.transport ?? 0, color: 'bg-indigo-500' },
                { name: 'Accommodation', val: trip.budget?.accommodation ?? 0, color: 'bg-teal-500' },
                { name: 'Activities', val: trip.budget?.activities ?? 0, color: 'bg-amber-500' },
                { name: 'Food', val: trip.budget?.food ?? 0, color: 'bg-rose-500' },
                { name: 'Other', val: trip.budget?.other ?? 0, color: 'bg-slate-400' },
              ].map((cat) => (
                <div key={cat.name} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{cat.name}</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-1">₹{cat.val.toLocaleString('en-IN')}</p>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${cat.color}`}
                      style={{ width: `${totalBudgetVal > 0 ? (cat.val / totalBudgetVal) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{totalBudgetVal > 0 ? Math.round((cat.val / totalBudgetVal) * 100) : 0}%</p>
                </div>
              ))}
            </div>
            <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between flex-wrap gap-2 ${
              totalBudgetVal - budgetSum >= 0
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              <span>{totalBudgetVal - budgetSum >= 0 ? '✅ Within Budget' : '⚠️ Over Budget'}</span>
              <span>₹{Math.abs(totalBudgetVal - budgetSum).toLocaleString('en-IN')} {totalBudgetVal - budgetSum >= 0 ? 'remaining' : 'over'}</span>
            </div>
            <div className="mt-6 h-40 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-2">
              <PiggyBank size={24} />
              <p className="text-xs font-medium">📊 Placeholder — Member 4: Recharts Donut Chart goes here</p>
            </div>
          </div>
        )}

        {/* ---- TIMELINE ---- */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Chronological Timeline</h3>
              <p className="text-xs text-slate-400 mt-1">Day-by-day sequence of your trip activities.</p>
            </div>
            {(!trip.activities || trip.activities.filter(a => a.date).length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-8">No dated activities to show in the timeline yet.</p>
            ) : (
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 flex flex-col gap-6">
                {[...trip.activities]
                  .filter(a => a.date)
                  .sort((a, b) => (a.date! > b.date! ? 1 : -1))
                  .map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[29px] top-0.5 bg-white border-2 border-indigo-500 w-4 h-4 rounded-full" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        📅 {act.date}{act.startTime ? ` · ${act.startTime}` : ''}
                      </p>
                      <h4 className="font-bold text-sm text-slate-800 mt-1">{act.name}</h4>
                      {act.description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>}
                      <span className="inline-block mt-1.5 text-[9px] font-semibold uppercase tracking-widest text-indigo-500">
                        {act.category} · ₹{act.cost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
              </div>
            )}
            <div className="mt-8 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
              <p className="text-xs text-slate-400 font-medium">🔧 Placeholder — Member 4: Full Timeline component goes here</p>
            </div>
          </div>
        )}
      </div>

      {/* ---- SHARE MODAL ---- */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share This Trip"
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            Share this trip link with others. Anyone with the link can view your itinerary.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-600 font-mono outline-none select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={copiedLink ? <Check size={14} /> : <Copy size={14} />}
              className="px-4 font-semibold text-xs flex-shrink-0"
            >
              {copiedLink ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---- DELETE MODAL ---- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete this trip?"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
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
                Deleting <strong>"{trip.name}"</strong> will permanently remove all destinations, activities, and budget data.
              </p>
            </div>
          </div>
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={13} />
              {deleteError}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};
