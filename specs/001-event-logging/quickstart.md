# Quickstart Guide: Game Session Event Logging

**Feature**: 001-event-logging
**Date**: 2025-11-14
**Audience**: Developers implementing this feature

## Overview

This quickstart guide provides step-by-step instructions for implementing the game session event logging feature. Follow the phases sequentially to build the MVP.

---

## Prerequisites

### Development Environment

**Required**:
- Node.js 20+ and npm 10+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Code editor with TypeScript support (VS Code recommended)

**Project Setup**:
```bash
# Initialize Vue 3 + TypeScript + Vite project (latest versions)
npm create vite@latest game-session-logger -- --template vue-ts

cd game-session-logger
npm install

# Install dependencies (latest versions)
npm install dexie@latest                    # IndexedDB wrapper (4.x)
npm install tailwindcss @tailwindcss/vite   # Tailwind CSS 4.x with Vite plugin

# Install dev dependencies (optional for testing)
npm install -D vitest @vitest/ui
npm install -D @playwright/test
```

### Configure Tailwind CSS

**vite.config.ts** (add Tailwind plugin):
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),  // Add Tailwind CSS Vite plugin
  ],
})
```

**src/style.css** (replace contents):
```css
@import "tailwindcss";
```

### Configure TypeScript

**tsconfig.json** (ensure strict mode):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "strict": true,                    // ← Enable strict mode
    "noImplicitAny": true,
    "strictNullChecks": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve"
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Implementation Phases

### Phase 1: Setup Database Layer

**Files to Create**:
- `src/models/Session.ts`
- `src/models/Event.ts`
- `src/services/db.ts`

**Step 1.1**: Define TypeScript types

**src/models/Session.ts**:
```typescript
export interface Session {
  id: string;
  name: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

export function validateSessionName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Session name cannot be empty';
  if (trimmed.length > 100) return 'Session name must be 100 characters or less';
  return null;
}
```

**src/models/Event.ts**:
```typescript
export const EVENT_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export type EventTag = typeof EVENT_TAGS[number];

export interface Event {
  id: string;
  sessionId: string;
  tag: EventTag;
  timestamp: string;  // ISO 8601
  description: string;
}

export function isValidEventTag(tag: string): tag is EventTag {
  return EVENT_TAGS.includes(tag as EventTag);
}

export function validateEventDescription(description: string): string | null {
  if (description.length > 500) return 'Description must be 500 characters or less';
  return null;
}
```

**Step 1.2**: Initialize Dexie database

**src/services/db.ts**:
```typescript
import Dexie, { Table } from 'dexie';
import type { Session } from '../models/Session';
import type { Event } from '../models/Event';

export class GameSessionDatabase extends Dexie {
  sessions!: Table<Session, string>;
  events!: Table<Event, string>;

  constructor() {
    super('GameSessionLoggerDB');

    this.version(1).stores({
      sessions: 'id, createdAt',
      events: 'id, [sessionId+timestamp]'
    });
  }
}

export const db = new GameSessionDatabase();
```

**Validation**: Open browser DevTools → Application → IndexedDB → should see `GameSessionLoggerDB` after running app

---

### Phase 2: Build State Management (Composables)

**Files to Create**:
- `src/composables/useSessionStore.ts`
- `src/composables/useEventStore.ts`
- `src/composables/useClipboard.ts`

**Step 2.1**: Session store

**src/composables/useSessionStore.ts**:
```typescript
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
```

**Step 2.2**: Event store (similar pattern to session store)

**Step 2.3**: Clipboard composable

**src/composables/useClipboard.ts**:
```typescript
import { ref } from 'vue';

export function useClipboard() {
  const isCopying = ref(false);
  const error = ref<string | null>(null);

  async function copyToClipboard(text: string): Promise<void> {
    error.value = null;
    isCopying.value = true;

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      await navigator.clipboard.writeText(text);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      throw err;
    } finally {
      isCopying.value = false;
    }
  }

  return {
    isCopying,
    error,
    copyToClipboard
  };
}
```

---

### Phase 3: Build UI Components

**Component Order** (build in this sequence):

1. **SessionSelector.vue** - Session creation and switching
2. **EventLogger.vue** - Event tag buttons + inline description field
3. **EventCard.vue** - Single event display with inline delete confirmation
4. **EventList.vue** - List of events with reverse chronological sorting
5. **MarkdownExporter.vue** - Copy to clipboard button

**Example Component Structure**:

**src/components/SessionSelector.vue**:
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSessionStore } from '../composables/useSessionStore';

const { sessions, activeSession, createSession, setActiveSession } = useSessionStore();
const newSessionName = ref('');
const isCreating = ref(false);

async function handleCreateSession() {
  if (!newSessionName.value.trim()) return;

  isCreating.value = true;
  try {
    const session = await createSession(newSessionName.value);
    await setActiveSession(session.id);
    newSessionName.value = '';
  } catch (err) {
    console.error('Failed to create session:', err);
  } finally {
    isCreating.value = false;
  }
}

async function handleSelectSession(sessionId: string) {
  await setActiveSession(sessionId);
}
</script>

<template>
  <div class="space-y-4 p-4 bg-gray-100 rounded-lg">
    <h2 class="text-xl font-bold">Sessions</h2>

    <!-- Create new session -->
    <div class="flex gap-2">
      <input
        v-model="newSessionName"
        type="text"
        placeholder="Session name"
        maxlength="100"
        class="flex-1 px-3 py-2 border rounded-md"
        @keyup.enter="handleCreateSession"
      />
      <button
        @click="handleCreateSession"
        :disabled="isCreating || !newSessionName.trim()"
        class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
      >
        Create
      </button>
    </div>

    <!-- Session list -->
    <div class="space-y-2">
      <button
        v-for="session in sessions"
        :key="session.id"
        @click="handleSelectSession(session.id)"
        class="w-full text-left px-3 py-2 rounded-md transition"
        :class="[
          activeSession?.id === session.id
            ? 'bg-blue-500 text-white'
            : 'bg-white hover:bg-gray-50'
        ]"
      >
        {{ session.name }}
      </button>
    </div>
  </div>
</template>
```

**Repeat similar pattern for other components** (see contracts/composables-api.md for full API)

---

### Phase 4: Assemble App

**src/App.vue**:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useSessionStore } from './composables/useSessionStore';
import SessionSelector from './components/SessionSelector.vue';
import EventLogger from './components/EventLogger.vue';
import EventList from './components/EventList.vue';
import MarkdownExporter from './components/MarkdownExporter.vue';

const { activeSession, loadSessions } = useSessionStore();

onMounted(async () => {
  await loadSessions();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <h1 class="text-3xl font-bold text-center mb-6">Game Session Logger</h1>

    <div class="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
      <!-- Left column: Session selector -->
      <div class="md:col-span-1">
        <SessionSelector />
      </div>

      <!-- Right column: Event logging -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="activeSession">
          <EventLogger :sessionId="activeSession.id" />
          <MarkdownExporter :sessionId="activeSession.id" class="mt-4" />
          <EventList :sessionId="activeSession.id" class="mt-6" />
        </div>
        <div v-else class="text-center text-gray-500 py-12">
          Select or create a session to start logging events
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## Testing

### Manual Testing Checklist

**Session Management**:
- [ ] Can create new session with valid name
- [ ] Cannot create session with empty name
- [ ] Cannot create session with name > 100 characters
- [ ] Can switch between sessions
- [ ] Active session persists after page refresh
- [ ] Can delete session (cascades to events)

**Event Logging**:
- [ ] Can log event with tag only (no description)
- [ ] Can log event with tag + description
- [ ] Events appear immediately in list (reverse chronological)
- [ ] Timestamp shows in HH:MM format (locale-aware)
- [ ] Description limited to 500 characters

**Event Deletion**:
- [ ] Click delete shows inline confirmation
- [ ] Confirm deletes event
- [ ] Cancel closes confirmation without deleting
- [ ] Bulk delete removes all events with confirmation

**Clipboard Export**:
- [ ] Copy to clipboard generates markdown table
- [ ] Table has columns: Time, Event Type, Description
- [ ] Markdown renders correctly in Discord/Slack/GitHub
- [ ] Special characters in descriptions are escaped
- [ ] Copy with no events shows appropriate message

**Responsiveness**:
- [ ] Layout works on mobile (320px width)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on desktop (1024px+ width)

### Automated Testing (Optional)

**Unit Tests** (Vitest):
```typescript
// tests/unit/models/Session.test.ts
import { describe, it, expect } from 'vitest';
import { validateSessionName } from '@/models/Session';

describe('validateSessionName', () => {
  it('rejects empty name', () => {
    expect(validateSessionName('')).toBe('Session name cannot be empty');
  });

  it('rejects name > 100 chars', () => {
    const longName = 'a'.repeat(101);
    expect(validateSessionName(longName)).toContain('100 characters');
  });

  it('accepts valid name', () => {
    expect(validateSessionName('Session 1')).toBeNull();
  });
});
```

**E2E Tests** (Playwright):
```typescript
// tests/e2e/session-logging.spec.ts
import { test, expect } from '@playwright/test';

test('create session and log event', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Create session
  await page.fill('input[placeholder="Session name"]', 'Test Session');
  await page.click('button:has-text("Create")');

  // Verify session is active
  await expect(page.locator('text=Test Session').first()).toHaveClass(/bg-blue-500/);

  // Log event
  await page.click('button:has-text("Combat")');

  // Verify event appears
  await expect(page.locator('text=Combat')).toBeVisible();
});
```

---

## Deployment

### Production Build

```bash
npm run build
```

**Output**: `dist/` folder with optimized static files

**Deployment Options**:
1. **Static hosting**: Netlify, Vercel, GitHub Pages
2. **Self-hosted**: nginx, Apache, or any static file server

**Example Netlify deployment**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Troubleshooting

### Issue: IndexedDB not working

**Symptoms**: Sessions/events not persisting

**Solutions**:
- Check browser privacy settings (IndexedDB may be disabled in private mode)
- Verify database name in DevTools → Application → IndexedDB
- Check for quota exceeded errors in console

### Issue: Clipboard copy fails

**Symptoms**: "Clipboard access denied" error

**Solutions**:
- Ensure user initiated action (button click, not automatic)
- Check browser permissions for clipboard access
- Test in supported browser (Chrome 90+, Firefox 88+, Safari 14+)

### Issue: TypeScript errors during build

**Symptoms**: `tsc` errors about missing types

**Solutions**:
- Ensure `strict: true` in tsconfig.json
- Add explicit type annotations to all functions
- Import types from `/models` for all entities

---

## Next Steps

After MVP is complete:

1. **Add unit tests** for composables and utilities
2. **Add E2E tests** for critical user flows
3. **Implement dark mode** using Tailwind's `dark:` variant
4. **Add session archival** feature
5. **Implement data export/import** (JSON format)
6. **Add keyboard shortcuts** for power users
7. **Optimize bundle size** (tree-shaking, code splitting)

---

## Resources

- **Vue 3 Docs**: https://vuejs.org/guide/
- **Dexie.js Docs**: https://dexie.org/docs/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **MDN Clipboard API**: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
