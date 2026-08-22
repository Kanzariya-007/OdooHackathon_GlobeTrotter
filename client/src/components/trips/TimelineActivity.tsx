import React from 'react';
import { Activity } from '../../types/trip';
import { MapPin, Clock, DollarSign, Utensils, Hotel, Car, Compass } from 'lucide-react';

interface TimelineActivityProps {
  activity: Activity;
}

export const TimelineActivity: React.FC<TimelineActivityProps> = ({ activity }) => {
  // Helper to get category-specific styling
  const getCategoryTheme = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('transport')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-100',
        icon: <Car size={13} />
      };
    }
    if (cat.includes('accommodation')) {
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-100',
        icon: <Hotel size={13} />
      };
    }
    if (cat.includes('food')) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-100',
        icon: <Utensils size={13} />
      };
    }
    if (cat.includes('activity') || cat.includes('activities')) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        icon: <Compass size={13} />
      };
    }
    return {
      bg: 'bg-slate-50 text-slate-700 border-slate-100',
      icon: <Compass size={13} />
    };
  };

  const theme = getCategoryTheme(activity.category);

  return (
    <div className="flex gap-4 group text-left">
      {/* Time & Bullet Node */}
      <div className="flex flex-col items-center">
        {/* Outer Circle Ring */}
        <div className="w-8 h-8 rounded-full border border-slate-150 bg-white shadow-xs flex items-center justify-center group-hover:border-indigo-500 transition-colors duration-200">
          <span className="text-slate-500 group-hover:text-indigo-600 transition-colors">
            {theme.icon}
          </span>
        </div>
      </div>

      {/* Activity Details Card */}
      <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3.5 hover:border-slate-200 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-extrabold text-xs text-slate-800 tracking-tight leading-snug">
              {activity.name}
            </h5>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.bg}`}>
              {activity.category}
            </span>
          </div>

          {activity.description && (
            <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">
              {activity.description}
            </p>
          )}

          {activity.location && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-medium">
              <MapPin size={11} />
              <span>{activity.location}</span>
            </div>
          )}
        </div>

        {/* Schedule & Cost Info */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 text-xs text-slate-500 min-w-[100px] border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0">
          {activity.startTime && (
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <Clock size={11} className="text-slate-400" />
              {activity.startTime} {activity.endTime ? ` - ${activity.endTime}` : ''}
            </span>
          )}
          <span className="font-extrabold text-slate-800 text-sm">
            ₹{activity.cost.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
