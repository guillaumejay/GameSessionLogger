# Quickstart: Event Duration Tracking

**Feature**: 004-event-duration
**Date**: 2025-12-04

## Overview

This feature adds duration tracking to events in the game session logger. Events can be closed manually or automatically when a new event is created.

## Key Changes

### 1. Event Model Extension

```typescript
// src/models/Event.ts
export interface Event {
  id: string;
  sessionId: string;
  tag: EventTag;
  timestamp: string;        // Start time
  endTimestamp?: string;    // NEW: End time (optional)
  description: string;
}
```

### 2. New Utility: Duration Formatting

```typescript
// src/utils/duration.ts
export function formatDuration(startIso: string, endIso: string): string {
  const ms = Date.parse(endIso) - Date.parse(startIso);
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (minutes < 1) return '< 1 min';
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${remainingMinutes}min`;
}
```

### 3. Event Store Updates

```typescript
// src/composables/useEventStore.ts

// Close an event
async function closeEvent(eventId: string): Promise<void> {
  const endTimestamp = new Date().toISOString();
  await db.events.update(eventId, { endTimestamp });
}

// Modified createEvent - auto-closes previous open event
async function createEvent(sessionId: string, tag: EventTag, description: string): Promise<Event> {
  const now = new Date().toISOString();

  // Auto-close any open events in this session
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
```

### 4. EventCard Component Updates

```vue
<!-- src/components/EventCard.vue -->
<template>
  <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-700">
            {{ event.tag }}
          </span>
          <span class="text-sm text-gray-600">{{ formattedTime }}</span>

          <!-- Duration or Ongoing badge -->
          <span v-if="isOpen" class="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
            {{ $t('event.ongoing') }}
          </span>
          <span v-else-if="durationDisplay" class="text-xs text-gray-500">
            {{ durationDisplay }}
          </span>
          <span v-else class="text-xs text-gray-400">—</span>
        </div>
        <!-- ... description ... -->
      </div>

      <!-- Close button (only for open events) -->
      <button
        v-if="isOpen"
        @click="$emit('close-event', event.id)"
        class="px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded"
      >
        {{ $t('event.close', { tag: event.tag }) }}
      </button>

      <!-- Delete button (existing) -->
      <!-- ... -->
    </div>
  </div>
</template>
```

### 5. i18n Keys

```json
// en.json
{
  "event": {
    "close": "Close {tag}",
    "ongoing": "Ongoing",
    "duration": "{duration}"
  }
}

// fr.json
{
  "event": {
    "close": "Fermer {tag}",
    "ongoing": "En cours",
    "duration": "{duration}"
  }
}
```

### 6. Markdown Export Update

```typescript
// src/utils/markdown.ts
export function formatEventsAsMarkdownTable(events: Event[]): string {
  const header = '| Time | Event Type | Duration | Description |';
  const separator = '|------|------------|----------|-------------|';

  const rows = events.map(event => {
    const time = formatTime(event.timestamp);
    const duration = event.endTimestamp
      ? formatDuration(event.timestamp, event.endTimestamp)
      : (event.endTimestamp === undefined ? '—' : 'Ongoing');
    const description = escapeMarkdownCharacters(event.description || '');

    return `| ${time} | ${event.tag} | ${duration} | ${description} |`;
  });

  return [header, separator, ...rows].join('\n');
}
```

## Database Migration

No explicit migration code needed. Dexie v3 schema upgrade:

```typescript
// src/services/db.ts
this.version(3).stores({
  sessions: 'id, type, createdAt',
  events: 'id, [sessionId+timestamp]'
});
```

Existing events will have `endTimestamp: undefined` automatically.

## Testing Checklist

- [ ] Create event → displays "Ongoing" badge
- [ ] Click "Close [Tag]" → event shows duration
- [ ] Create new event → previous event auto-closed with duration
- [ ] Legacy events (pre-migration) → display "—" for duration
- [ ] Copy markdown → includes Duration column
- [ ] Duration formats correctly: `< 1 min`, `5 min`, `1h 30min`
