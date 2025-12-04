import type { Event } from '../models/Event';

/**
 * Duration display result types
 */
export type DurationDisplay =
  | { type: 'ongoing' }                     // Open event (no endTimestamp)
  | { type: 'unknown' }                     // Legacy event (no endTimestamp, treated as closed)
  | { type: 'duration'; formatted: string } // Closed event with calculated duration

/**
 * Format duration between two ISO timestamps into human-readable string
 * @param startIso - ISO 8601 start timestamp
 * @param endIso - ISO 8601 end timestamp
 * @returns Formatted duration string (e.g., "< 1 min", "45 min", "1h 20min")
 */
export function formatDuration(startIso: string, endIso: string): string {
  const ms = Date.parse(endIso) - Date.parse(startIso);
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes < 1) return '< 1 min';
  if (hours === 0) return `${totalMinutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

/**
 * Get duration display info for an event
 * @param event - The event to get duration for
 * @param isNewEvent - Whether this is a newly created event (shows "Ongoing" vs "—" for legacy)
 * @returns DurationDisplay object with type and formatted string if applicable
 */
export function getEventDurationDisplay(event: Event, isNewEvent: boolean = false): DurationDisplay {
  // Event has an end timestamp - calculate and display duration
  if (event.endTimestamp) {
    return {
      type: 'duration',
      formatted: formatDuration(event.timestamp, event.endTimestamp)
    };
  }

  // No end timestamp - determine if it's ongoing or legacy
  // New events without endTimestamp are "ongoing"
  // Legacy events (pre-migration) without endTimestamp show "—" (unknown)
  if (isNewEvent) {
    return { type: 'ongoing' };
  }

  return { type: 'unknown' };
}

/**
 * Check if an event is open (has no end timestamp)
 * @param event - The event to check
 * @returns true if the event is open (ongoing), false if closed
 */
export function isEventOpen(event: Event): boolean {
  return event.endTimestamp === undefined || event.endTimestamp === null;
}
