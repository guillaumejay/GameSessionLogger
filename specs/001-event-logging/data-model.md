# Data Model: Game Session Event Logging

**Feature**: 001-event-logging
**Date**: 2025-11-14
**Phase**: 1 - Data Model Design

## Overview

This document defines the data entities, their relationships, validation rules, and state transitions for the game session event logging feature.

## Entity Relationship Diagram

```
┌─────────────────┐
│    Session      │
│─────────────────│
│ id (PK)         │───┐
│ name            │   │
│ createdAt       │   │
│ updatedAt       │   │
└─────────────────┘   │
                      │ 1:N
                      │
                   ┌──▼──────────────┐
                   │     Event       │
                   │─────────────────│
                   │ id (PK)         │
                   │ sessionId (FK)  │
                   │ tag             │
                   │ timestamp       │
                   │ description     │
                   └─────────────────┘
```

**Relationship**: One Session has Many Events (1:N)

## Entities

### Session

Represents a named game session that contains multiple logged events.

**TypeScript Interface**:
```typescript
interface Session {
  id: string;              // UUID v4
  name: string;            // User-provided session name
  createdAt: Date;         // ISO 8601 timestamp
  updatedAt: Date;         // ISO 8601 timestamp, updated on session modification
}
```

**Fields**:
- **id** (string, required, unique)
  - Primary key
  - Format: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
  - Generated automatically on creation using `crypto.randomUUID()`

- **name** (string, required)
  - User-provided name to identify the session
  - Constraints:
    - Minimum length: 1 character
    - Maximum length: 100 characters
    - Must not be empty or only whitespace
  - Uniqueness: Not enforced at database level, but UI should warn about duplicates
  - Examples: "Session 2025-01-15", "Dragon Heist Chapter 3", "One-Shot: Goblin Cave"

- **createdAt** (Date, required)
  - Timestamp when the session was created
  - Format: ISO 8601 (stored as ISO string in IndexedDB)
  - Set automatically on creation: `new Date().toISOString()`

- **updatedAt** (Date, required)
  - Timestamp when the session was last modified
  - Format: ISO 8601 (stored as ISO string in IndexedDB)
  - Updated automatically on any modification: `new Date().toISOString()`

**Indexes**:
- Primary key: `id`
- Secondary index: `createdAt` (for chronological sorting of sessions)

**Validation Rules**:
- `name` must not be empty after trimming whitespace
- `name` length must be between 1 and 100 characters
- `id` must be valid UUID v4 format
- `createdAt` and `updatedAt` must be valid ISO 8601 date strings

**State Transitions**:
- **Created**: User creates new session → `id`, `name`, `createdAt`, `updatedAt` set
- **Selected**: User switches to this session → becomes active session (stored in localStorage)
- **Modified**: User renames session (future feature) → `updatedAt` updated
- **Deleted**: User deletes session → cascading delete of all related events

---

### Event

Represents a single logged occurrence within a game session.

**TypeScript Interface**:
```typescript
type EventTag = 'Combat' | 'Roleplay' | 'Downtime' | 'Scoring' | 'Meal' | 'Other';

interface Event {
  id: string;              // UUID v4
  sessionId: string;       // Foreign key to Session.id
  tag: EventTag;           // Predefined event category
  timestamp: Date;         // ISO 8601 timestamp when event was logged
  description: string;     // Optional user-provided description
}
```

**Fields**:
- **id** (string, required, unique)
  - Primary key
  - Format: UUID v4
  - Generated automatically on creation using `crypto.randomUUID()`

- **sessionId** (string, required)
  - Foreign key referencing Session.id
  - Establishes relationship between event and its parent session
  - Used for filtering events by session

- **tag** (EventTag, required)
  - Predefined category for the event
  - Enum values: `'Combat'`, `'Roleplay'`, `'Downtime'`, `'Scoring'`, `'Meal'`, `'Other'`
  - Constraints: Must be one of the allowed values (enforced by TypeScript type)

- **timestamp** (Date, required)
  - Date and time when the event was logged
  - Format: ISO 8601 (stored as ISO string in IndexedDB)
  - Set automatically on creation: `new Date().toISOString()`
  - Displayed to user in HH:MM format (locale-aware)

- **description** (string, optional)
  - User-provided text describing the event
  - Constraints:
    - Maximum length: 500 characters (prevents storage bloat)
    - Can be empty string (represents no description)
  - Special characters: Must be escaped when exporting to markdown

**Indexes**:
- Primary key: `id`
- Composite index: `[sessionId, timestamp]` (for efficient querying of events by session in chronological order)

**Validation Rules**:
- `tag` must be one of: Combat, Roleplay, Downtime, Scoring, Meal, Other
- `sessionId` must reference an existing Session.id
- `description` length must not exceed 500 characters
- `timestamp` must be valid ISO 8601 date string
- `id` must be valid UUID v4 format

**State Transitions**:
- **Created**: User clicks event tag → `id`, `sessionId`, `tag`, `timestamp`, `description` set
- **Displayed**: Event shown in EventList component, sorted by timestamp (reverse chronological)
- **Deleted**: User confirms inline deletion → event removed from IndexedDB

---

## Relationships

### Session → Events (1:N)

**Cardinality**: One Session can have zero or many Events

**Referential Integrity**:
- **Cascade Delete**: When a Session is deleted, all related Events must also be deleted
- **Orphan Prevention**: Events cannot exist without a parent Session
- Implementation: Dexie.js query to delete all events where `sessionId = deletedSessionId`

**Query Patterns**:
```typescript
// Get all events for a session (reverse chronological)
db.events
  .where('sessionId').equals(sessionId)
  .reverse()
  .sortBy('timestamp')

// Get event count for a session
db.events.where('sessionId').equals(sessionId).count()

// Delete all events for a session
db.events.where('sessionId').equals(sessionId).delete()
```

---

## Dexie.js Schema

```typescript
import Dexie, { Table } from 'dexie';

export interface Session {
  id: string;
  name: string;
  createdAt: string;  // ISO 8601 string
  updatedAt: string;  // ISO 8601 string
}

export type EventTag = 'Combat' | 'Roleplay' | 'Downtime' | 'Scoring' | 'Meal' | 'Other';

export interface Event {
  id: string;
  sessionId: string;
  tag: EventTag;
  timestamp: string;  // ISO 8601 string
  description: string;
}

export class GameSessionDatabase extends Dexie {
  sessions!: Table<Session, string>;  // Table<Type, PrimaryKeyType>
  events!: Table<Event, string>;

  constructor() {
    super('GameSessionLoggerDB');

    this.version(1).stores({
      sessions: 'id, createdAt',                    // PK: id, Index: createdAt
      events: 'id, [sessionId+timestamp]'           // PK: id, Composite: sessionId+timestamp
    });
  }
}

export const db = new GameSessionDatabase();
```

---

## Storage Constraints

### IndexedDB Quotas

**Browser Storage Limits**:
- **Chrome/Edge**: ~60% of available disk space (per origin)
- **Firefox**: ~50% of available disk space (per origin)
- **Safari**: 1GB initial, prompts for more

**Estimated Data Size**:
- Session: ~200 bytes (100 char name + metadata)
- Event: ~600 bytes (tag + timestamp + 500 char description)
- 100 events per session: ~60KB per session
- 100 sessions: ~6MB total

**Quota Handling**:
- Monitor storage usage via `navigator.storage.estimate()` (if available)
- Show warning when approaching 80% of quota
- Provide session deletion and markdown export for data archival

---

## Data Integrity Rules

### Constraints Enforced by Application Logic

1. **Session name uniqueness check** (soft constraint):
   - UI warns user if session name already exists
   - Does not prevent creation (user may want duplicate names for different dates)

2. **Active session reference**:
   - Current active session ID stored in `localStorage` under key `activeSessionId`
   - Validated on app load; if session doesn't exist in IndexedDB, prompt user to select/create session

3. **Event description character limit**:
   - Input field maxlength attribute: 500 characters
   - Validation before save: trim and check length

4. **Cascade deletion**:
   - When session deleted, query and delete all events with matching `sessionId`
   - Implemented in `useSessionStore.deleteSession()` composable

### Validation Functions

```typescript
// src/models/Session.ts
export const EVENT_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export type EventTag = typeof EVENT_TAGS[number];

export function isValidEventTag(tag: string): tag is EventTag {
  return EVENT_TAGS.includes(tag as EventTag);
}

export function validateSessionName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Session name cannot be empty';
  if (trimmed.length > 100) return 'Session name must be 100 characters or less';
  return null;  // valid
}

export function validateEventDescription(description: string): string | null {
  if (description.length > 500) return 'Description must be 500 characters or less';
  return null;  // valid
}
```

---

## Migration Strategy

**Version 1** (Initial):
- Sessions table: `id, createdAt`
- Events table: `id, [sessionId+timestamp]`

**Future Versions** (examples):
- v2: Add `sessions.archived` boolean field for soft delete
- v3: Add `events.editedAt` field to track modifications
- v4: Add `sessions.color` field for visual categorization

**Migration Execution**:
```typescript
// In db.ts service
this.version(2).stores({
  sessions: 'id, createdAt, archived',  // Add indexed field
  events: 'id, [sessionId+timestamp]'   // Unchanged
}).upgrade(tx => {
  // Migration logic for existing data
  return tx.table('sessions').toCollection().modify(session => {
    session.archived = false;  // Set default value
  });
});
```

---

## Summary

- **2 entities**: Session (1) → Event (N)
- **Primary keys**: UUID v4 strings
- **Indexes**: Optimized for chronological queries
- **Storage**: IndexedDB via Dexie.js with TypeScript types
- **Validation**: Client-side with clear error messages
- **Integrity**: Cascade delete, orphan prevention, quota monitoring
