import { ref } from 'vue';
import { liveQuery } from 'dexie';
import { db } from '../services/db';
import type { Event, EventTag } from '../models/Event';
import { isValidEventTag, validateEventDescription } from '../models/Event';

const events = ref<Event[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useEventStore() {
  async function createEvent(sessionId: string, tag: EventTag, description: string): Promise<Event> {
    error.value = null;

    if (!sessionId) throw new Error('No active session');
    if (!isValidEventTag(tag)) throw new Error('Invalid event tag');

    const validationError = validateEventDescription(description);
    if (validationError) throw new Error(validationError);

    const now = new Date().toISOString();

    // Auto-close any open events in this session before creating new one
    const openEvents = await db.events
      .where('sessionId')
      .equals(sessionId)
      .filter(e => !e.endTimestamp)
      .toArray();

    for (const openEvent of openEvents) {
      await db.events.update(openEvent.id, { endTimestamp: now });
    }

    // Create new event (without endTimestamp = open)
    const event: Event = {
      id: crypto.randomUUID(),
      sessionId,
      tag,
      timestamp: now,
      description: description.trim()
    };

    await db.events.add(event);
    return event;
  }

  async function deleteEvent(eventId: string): Promise<void> {
    error.value = null;
    await db.events.delete(eventId);
  }

  async function deleteAllEvents(sessionId: string): Promise<void> {
    error.value = null;
    await db.events.where('sessionId').equals(sessionId).delete();
  }

  async function closeEvent(eventId: string): Promise<void> {
    error.value = null;
    const endTimestamp = new Date().toISOString();
    await db.events.update(eventId, { endTimestamp });
  }

  function loadEvents(sessionId: string): void {
    // Live query for events of the current session
    liveQuery(() =>
      db.events
        .where('sessionId')
        .equals(sessionId)
        .reverse()
        .sortBy('timestamp')
    ).subscribe(result => {
      events.value = result;
    });
  }

  return {
    events,
    isLoading,
    error,
    createEvent,
    deleteEvent,
    deleteAllEvents,
    closeEvent,
    loadEvents
  };
}
