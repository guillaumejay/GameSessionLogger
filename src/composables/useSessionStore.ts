import { ref, computed } from 'vue';
import { liveQuery } from 'dexie';
import { db } from '../services/db';
import type { Session } from '../models/Session';
import { validateSessionName } from '../models/Session';
import type { SessionType } from '../models/SessionType';
import { isValidSessionType, normalizeSessionType } from '../models/SessionType';

const sessions = ref<Session[]>([]);
const activeSessionId = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Computed property that derives activeSession from sessions array
// This ensures activeSession is always in sync with the latest data
const activeSession = computed<Session | null>(() =>
  sessions.value.find(s => s.id === activeSessionId.value) ?? null
);

export function useSessionStore() {
  // Load sessions with live query and normalize types
  liveQuery(() => db.sessions.orderBy('createdAt').reverse().toArray())
    .subscribe(result => {
      // Normalize session types for corrupted data
      sessions.value = result.map(s => ({
        ...s,
        type: normalizeSessionType(s.type)
      }));
    });

  async function createSession(name: string, type: SessionType): Promise<Session> {
    error.value = null;
    const validationError = validateSessionName(name);
    if (validationError) throw new Error(validationError);

    if (!isValidSessionType(type)) {
      throw new Error('Invalid session type');
    }

    const session: Session = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.sessions.add(session);
    return session;
  }

  async function deleteSession(sessionId: string): Promise<void> {
    error.value = null;
    // Cascade delete events
    await db.events.where('sessionId').equals(sessionId).delete();
    await db.sessions.delete(sessionId);

    // Clear active session if deleted
    if (activeSessionId.value === sessionId) {
      activeSessionId.value = null;
      localStorage.removeItem('activeSessionId');
    }
  }

  async function setActiveSession(sessionId: string): Promise<void> {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    activeSessionId.value = sessionId;
    localStorage.setItem('activeSessionId', sessionId);
  }

  async function loadSessions(): Promise<void> {
    isLoading.value = true;
    try {
      // Restore active session from localStorage
      const savedId = localStorage.getItem('activeSessionId');
      if (savedId) {
        const session = await db.sessions.get(savedId);
        if (session) activeSessionId.value = savedId;
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    sessions,
    activeSession,
    isLoading,
    error,
    createSession,
    deleteSession,
    setActiveSession,
    loadSessions
  };
}
