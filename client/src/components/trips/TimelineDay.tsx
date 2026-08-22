import React from 'react';
import { Activity } from '../../types/trip';
import { TimelineActivity } from './TimelineActivity';
import { Compass, Calendar } from 'lucide-react';

interface TimelineDayProps {
  dateStr: string;
  dayIndex: number;
  activities: Activity[];
  cityStops: string[];
}

export const TimelineDay: React.FC<TimelineDayProps> = ({
  dateStr,
  dayIndex,
  activities,
  cityStops
}) => {
  const formatDateHeader = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left relative animate-in fade-in duration-300">
      
      {/* Day Node Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-xs">
            DAY {dayIndex}
          </div>
          <span className="font-extrabold text-slate-800 text-xs tracking-tight">
            {formatDateHeader(dateStr)}
          </span>
        </div>

        {/* Current Stops mapping */}
        {cityStops.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg">
            <Compass size={11} className="animate-spin-slow" />
            <span>Stops: {cityStops.join(' → ')}</span>
          </div>
        )}
      </div>

      {/* Activities Grid wrapper */}
      <div className="flex flex-col gap-4 pl-4 relative border-l border-slate-150 ml-4 py-1.5">
        {activities.length === 0 ? (
          <div className="flex items-center gap-3 py-2 pl-4 text-slate-400 italic text-xs">
            <Calendar size={13} className="text-slate-350" />
            <span>No scheduled activities for this day. Relax or explore!</span>
          </div>
        ) : (
          activities
            .sort((a, b) => {
              if (!a.startTime) return 1;
              if (!b.startTime) return -1;
              return a.startTime.localeCompare(b.startTime);
            })
            .map((activity) => (
              <TimelineActivity key={activity.id} activity={activity} />
            ))
        )}
      </div>

    </div>
  );
};
