import React, { useMemo } from 'react';
import { Trip, Activity } from '../../types/trip';
import { TimelineDay } from './TimelineDay';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Calendar, Plus } from 'lucide-react';

interface TimelineProps {
  trip: Trip;
  onAddActivityTrigger?: () => void;
  onAddStopTrigger?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  trip,
  onAddActivityTrigger,
  onAddStopTrigger
}) => {
  // Helper to generate local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate range of dates
  const tripDatesList = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const dates: string[] = [];
    const current = new Date(start);
    
    let limit = 100;
    while (current <= end && limit > 0) {
      dates.push(getLocalDateString(current));
      current.setDate(current.getDate() + 1);
      limit--;
    }
    return dates;
  }, [trip.startDate, trip.endDate]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    tripDatesList.forEach(d => {
      groups[d] = [];
    });

    (trip.activities || []).forEach(act => {
      if (act.date && groups[act.date]) {
        groups[act.date].push(act);
      }
    });

    return groups;
  }, [trip.activities, tripDatesList]);

  // Map dates to active cities in that timeframe
  // If cities have dates, we map them, otherwise we fallback to general destination lists
  const dateCityStops = useMemo(() => {
    const stops: Record<string, string[]> = {};
    
    tripDatesList.forEach(date => {
      // Find destinations whose location is active.
      // Since cities in destinations don't store individual date ranges directly (only trip itself does),
      // we check activities location properties or default to all destinations list.
      const activeCities: string[] = [];
      
      const dayActs = groupedActivities[date] || [];
      dayActs.forEach(a => {
        if (a.location && !activeCities.includes(a.location)) {
          activeCities.push(a.location);
        }
      });

      // Fallback: If no activity location matches, show all trip destinations
      if (activeCities.length === 0 && trip.destinations) {
        trip.destinations.forEach(d => {
          if (!activeCities.includes(d.city)) {
            activeCities.push(d.city);
          }
        });
      }

      stops[date] = activeCities;
    });

    return stops;
  }, [tripDatesList, groupedActivities, trip.destinations]);

  const totalActivitiesCount = trip.activities?.length ?? 0;

  if (totalActivitiesCount === 0) {
    const hasStops = (trip.destinations?.length ?? 0) > 0;
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-8 text-center animate-in fade-in duration-300">
        <EmptyState
          title="No timeline events configured"
          description={
            hasStops 
              ? "Activities scheduled in the itinerary builder will be dynamically mapped to your visual timeline."
              : "Please add at least one city stop under the Overview tab before scheduling activities."
          }
          icon={<Calendar size={32} />}
          action={
            hasStops ? (
              onAddActivityTrigger && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onAddActivityTrigger}
                  leftIcon={<Plus size={14} />}
                  className="font-semibold"
                >
                  Schedule Activity
                </Button>
              )
            ) : (
              onAddStopTrigger && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onAddStopTrigger}
                  leftIcon={<Plus size={14} />}
                  className="font-semibold"
                >
                  Add City Stop
                </Button>
              )
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {tripDatesList.map((dateStr, idx) => (
        <TimelineDay
          key={dateStr}
          dateStr={dateStr}
          dayIndex={idx + 1}
          activities={groupedActivities[dateStr] || []}
          cityStops={dateCityStops[dateStr] || []}
        />
      ))}
    </div>
  );
};
