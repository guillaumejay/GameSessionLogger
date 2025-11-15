import { ref } from 'vue';
import { liveQuery } from 'dexie';
import { db } from '../services/db';
import type { Session } from '../models/Session';
import { validateSessionName } from '../models/Session';

const sessions = ref<Session[]>([]);
const activeSession = ref<Session | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useSessionStore() {
  // Load sessions with live query
  liveQuery(() => db.sessions.orderBy('createdAt').reverse().toArray())
    .subscribe(result => {
      sessions.value = result;
    });

  async function createSession(name: string): Promise<Session> {
    error.value = null;
    const validationError = validateSessionName(name);
    if (validationError) throw new Error(validationError);

    const session: Session = {
      id: crypto.randomUUID(),
      name: name.trim(),
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
    if (activeSession.value?.id === sessionId) {
      activeSession.value = null;
      localStorage.removeItem('activeSessionId');
    }
  }

  async function setActiveSession(sessionId: string): Promise<void> {
    const session = await db.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    activeSession.value = session;
    localStorage.setItem('activeSessionId', sessionId);
  }

  async function loadSessions(): Promise<void> {
    isLoading.value = true;
    try {
      // Restore active session from localStorage
      const savedId = localStorage.getItem('activeSessionId');
      if (savedId) {
        const session = await db.sessions.get(savedId);
        if (session) activeSession.value = session;
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
