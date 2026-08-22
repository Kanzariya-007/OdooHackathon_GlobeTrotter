import React from 'react';
import { Calendar, MapPin, DollarSign, Eye, Edit2, Trash2 } from 'lucide-react';
import { Trip } from '../../types/trip';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const navigate = useNavigate();

  // Helper for formatting dates nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Safe fallback cover image
  const defaultCover = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
  const coverUrl = trip.coverImage && trip.coverImage.trim() !== '' ? trip.coverImage : defaultCover;

  // Safe budget check
  const estimatedBudget = trip.budget?.totalBudget ?? 0;
  const destinationsCount = trip.destinations?.length ?? 0;

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group">

      {/* Cover Image Banner */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={coverUrl}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultCover;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />

        {/* Float Badge: Days Count */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-800 px-2 py-1 rounded-md shadow-sm">
          {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1" title={trip.name}>
            {trip.name}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 min-h-[2rem] mb-4">
            {trip.description || "No description provided. Start adding details to plan your adventure."}
          </p>

          <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 mb-4 pt-1 border-t border-slate-50">
            <div className="flex items-center gap-1.5 col-span-2">
              <Calendar size={13} className="text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
              <span>{destinationsCount} {destinationsCount === 1 ? 'destination' : 'destinations'}</span>
            </div>

            <div className="flex items-center gap-1.5 justify-end">
              <DollarSign size={13} className="text-slate-400 flex-shrink-0" />
              <span className="font-bold text-slate-700">₹{estimatedBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-3.5 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/trips/${trip.id}`)}
            leftIcon={<Eye size={14} />}
            className="text-indigo-600 hover:bg-indigo-50 font-semibold flex-1 text-xs"
          >
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/trips/${trip.id}/edit`)}
            leftIcon={<Edit2 size={14} />}
            className="text-slate-600 hover:bg-slate-50 flex-1 text-xs"
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(trip.id)}
            leftIcon={<Trash2 size={14} />}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 flex-none px-2 text-xs"
            title="Delete Trip"
          />
        </div>
      </div>

    </div>
  );
};
