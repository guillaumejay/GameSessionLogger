# Composables API Contract

**Feature**: 001-event-logging
**Date**: 2025-11-14
**Phase**: 1 - Component Contracts

## Overview

This document defines the public API contracts for Vue 3 composables that manage application state and business logic. These composables serve as the "internal API" of the application, consumed by Vue components.

---

## useSessionStore

Manages session CRUD operations and active session state.

### API Signature

```typescript
interface UseSessionStore {
  // State
  sessions: Ref<Session[]>;           // All sessions, sorted by createdAt desc
  activeSession: Ref<Session | null>; // Currently selected session
  isLoading: Ref<boolean>;            // Loading state for async operations
  error: Ref<string | null>;          // Error message if operation fails

  // Actions
  createSession(name: string): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  setActiveSession(sessionId: string): Promise<void>;
  loadSessions(): Promise<void>;
}

function useSessionStore(): UseSessionStore;
```

### State Properties

#### `sessions: Ref<Session[]>`
- **Type**: Reactive reference to array of Session objects
- **Sorted**: By `createdAt` descending (newest first)
- **Updated**: Automatically when sessions are created/deleted via Dexie live queries
- **Initial Value**: Empty array `[]`

#### `activeSession: Ref<Session | null>`
- **Type**: Reactive reference to currently selected session or null
- **Persisted**: Session ID stored in localStorage under key `activeSessionId`
- **Updated**: When `setActiveSession()` is called
- **Initial Value**: `null` until session is selected

#### `isLoading: Ref<boolean>`
- **Type**: Boolean indicating async operation in progress
- **Usage**: Show loading spinners during session operations
- **True when**: Creating, deleting, or loading sessions
- **Initial Value**: `false`

#### `error: Ref<string | null>`
- **Type**: Error message string or null if no error
- **Usage**: Display error toast/message to user
- **Cleared**: Automatically before new operations
- **Initial Value**: `null`

### Actions

#### `createSession(name: string): Promise<Session>`

Creates a new game session.

**Parameters**:
- `name` (string, required): Session name (1-100 characters)

**Returns**: Promise resolving to created Session object

**Behavior**:
1. Validate name (length 1-100, not empty after trim)
2. Generate UUID v4 for `id`
3. Set `createdAt` and `updatedAt` to current ISO timestamp
4. Insert into IndexedDB via Dexie
5. Return created session object

**Errors**:
- Throws if validation fails: "Session name must be between 1 and 100 characters"
- Throws if IndexedDB operation fails: "Failed to create session: [error message]"

**Example**:
```typescript
const { createSession, error } = useSessionStore();

try {
  const session = await createSession('Dragon Heist Session 1');
  console.log('Created:', session.id);
} catch (err) {
  console.error(error.value);
}
```

---

#### `deleteSession(sessionId: string): Promise<void>`

Deletes a session and all its events (cascade delete).

**Parameters**:
- `sessionId` (string, required): UUID of session to delete

**Returns**: Promise resolving when deletion completes

**Behavior**:
1. Delete all events where `event.sessionId === sessionId`
2. Delete session from sessions table
3. If deleted session was active, clear `activeSession` and `activeSessionId` from localStorage

**Errors**:
- Throws if session not found: "Session not found"
- Throws if IndexedDB operation fails: "Failed to delete session: [error message]"

**Example**:
```typescript
const { deleteSession } = useSessionStore();
await deleteSession('550e8400-e29b-41d4-a716-446655440000');
```

---

#### `setActiveSession(sessionId: string): Promise<void>`

Sets the currently active session.

**Parameters**:
- `sessionId` (string, required): UUID of session to activate

**Returns**: Promise resolving when session is set

**Behavior**:
1. Verify session exists in IndexedDB
2. Update `activeSession.value` to session object
3. Persist session ID to localStorage under `activeSessionId`

**Errors**:
- Throws if session not found: "Session not found"

**Example**:
```typescript
const { setActiveSession, activeSession } = useSessionStore();
await setActiveSession('550e8400-e29b-41d4-a716-446655440000');
console.log('Active:', activeSession.value?.name);
```

---

#### `loadSessions(): Promise<void>`

Loads all sessions from IndexedDB and restores active session from localStorage.

**Parameters**: None

**Returns**: Promise resolving when sessions are loaded

**Behavior**:
1. Query all sessions from IndexedDB
2. Sort by `createdAt` descending
3. Update `sessions.value`
4. Retrieve `activeSessionId` from localStorage
5. If valid, set `activeSession.value` to that session

**Called**: Automatically on app initialization

**Example**:
```typescript
const { loadSessions, sessions } = useSessionStore();
await loadSessions();
console.log(`Loaded ${sessions.value.length} sessions`);
```

---

## useEventStore

Manages event CRUD operations for the active session.

### API Signature

```typescript
interface UseEventStore {
  // State
  events: Ref<Event[]>;               // Events for active session, reverse chronological
  isLoading: Ref<boolean>;            // Loading state
  error: Ref<string | null>;          // Error message

  // Actions
  createEvent(tag: EventTag, description: string): Promise<Event>;
  deleteEvent(eventId: string): Promise<void>;
  deleteAllEvents(sessionId: string): Promise<void>;
  loadEvents(sessionId: string): Promise<void>;
}

function useEventStore(): UseEventStore;
```

### State Properties

#### `events: Ref<Event[]>`
- **Type**: Reactive reference to array of Event objects for active session
- **Sorted**: By `timestamp` descending (most recent first)
- **Updated**: Automatically via Dexie live queries when events are added/deleted
- **Initial Value**: Empty array `[]`

#### `isLoading: Ref<boolean>`
- **Type**: Boolean indicating async operation in progress
- **Initial Value**: `false`

#### `error: Ref<string | null>`
- **Type**: Error message or null
- **Initial Value**: `null`

### Actions

#### `createEvent(tag: EventTag, description: string): Promise<Event>`

Creates a new event in the active session.

**Parameters**:
- `tag` (EventTag, required): One of 'Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'
- `description` (string, optional): Event description (0-500 characters)

**Returns**: Promise resolving to created Event object

**Preconditions**:
- Active session must be set (from `useSessionStore`)

**Behavior**:
1. Validate tag is valid EventTag
2. Validate description length ≤ 500 characters
3. Generate UUID v4 for `id`
4. Set `timestamp` to current ISO timestamp
5. Set `sessionId` to active session ID
6. Insert into IndexedDB

**Errors**:
- Throws if no active session: "No active session"
- Throws if invalid tag: "Invalid event tag"
- Throws if description too long: "Description must be 500 characters or less"

**Example**:
```typescript
const { createEvent } = useEventStore();
const event = await createEvent('Combat', 'Boss battle with dragon');
```

---

#### `deleteEvent(eventId: string): Promise<void>`

Deletes a single event.

**Parameters**:
- `eventId` (string, required): UUID of event to delete

**Returns**: Promise resolving when deletion completes

**Example**:
```typescript
const { deleteEvent } = useEventStore();
await deleteEvent('event-uuid-123');
```

---

#### `deleteAllEvents(sessionId: string): Promise<void>`

Deletes all events for a given session (bulk delete).

**Parameters**:
- `sessionId` (string, required): UUID of session whose events to delete

**Returns**: Promise resolving when all events are deleted

**Example**:
```typescript
const { deleteAllEvents } = useEventStore();
await deleteAllEvents(activeSession.value!.id);
```

---

#### `loadEvents(sessionId: string): Promise<void>`

Loads all events for a specific session.

**Parameters**:
- `sessionId` (string, required): UUID of session

**Returns**: Promise resolving when events are loaded

**Behavior**:
1. Query events where `event.sessionId === sessionId`
2. Sort by `timestamp` descending
3. Update `events.value`

**Example**:
```typescript
const { loadEvents, events } = useEventStore();
await loadEvents(activeSession.value!.id);
console.log(`Loaded ${events.value.length} events`);
```

---

## useClipboard

Handles clipboard operations with error handling.

### API Signature

```typescript
interface UseClipboard {
  // State
  isCopying: Ref<boolean>;            // True during copy operation
  error: Ref<string | null>;          // Error message if copy fails

  // Actions
  copyToClipboard(text: string): Promise<void>;
}

function useClipboard(): UseClipboard;
```

### Actions

#### `copyToClipboard(text: string): Promise<void>`

Copies text to clipboard using Clipboard API.

**Parameters**:
- `text` (string, required): Text to copy

**Returns**: Promise resolving when copy succeeds

**Behavior**:
1. Set `isCopying.value = true`
2. Call `navigator.clipboard.writeText(text)`
3. On success: Set `isCopying.value = false`, clear error
4. On failure: Set `error.value` with user-friendly message

**Errors**:
- Throws if Clipboard API unavailable: "Clipboard API not supported"
- Throws if permission denied: "Clipboard access denied. Please check browser permissions."

**Example**:
```typescript
const { copyToClipboard, isCopying, error } = useClipboard();

await copyToClipboard('| Time | Event | Description |\n|------|-------|-------------|');

if (error.value) {
  console.error('Copy failed:', error.value);
}
```

---

## Component Props/Emits Contracts

### SessionSelector.vue

**Props**: None

**Emits**:
- `session-created`: Emitted when new session is created
  - Payload: `Session` object

**Usage**:
```vue
<SessionSelector @session-created="handleSessionCreated" />
```

---

### EventLogger.vue

**Props**:
- `sessionId` (string, required): Active session ID

**Emits**:
- `event-created`: Emitted when new event is logged
  - Payload: `Event` object

**Usage**:
```vue
<EventLogger :sessionId="activeSession.id" @event-created="handleEventCreated" />
```

---

### EventList.vue

**Props**:
- `sessionId` (string, required): Session ID to display events for

**Emits**:
- `event-deleted`: Emitted when an event is deleted
  - Payload: `eventId` (string)
- `all-events-deleted`: Emitted when all events are deleted
  - Payload: `sessionId` (string)

**Usage**:
```vue
<EventList :sessionId="activeSession.id" @event-deleted="handleEventDeleted" />
```

---

### EventCard.vue

**Props**:
- `event` (Event, required): Event object to display
- `showInlineConfirmation` (boolean, optional, default: false): Show/hide delete confirmation

**Emits**:
- `delete-requested`: Emitted when user clicks delete
  - Payload: `eventId` (string)
- `delete-confirmed`: Emitted when user confirms deletion
  - Payload: `eventId` (string)
- `delete-cancelled`: Emitted when user cancels deletion
  - Payload: None

**Usage**:
```vue
<EventCard
  :event="event"
  :showInlineConfirmation="confirmingId === event.id"
  @delete-requested="confirmingId = event.id"
  @delete-confirmed="handleDelete"
  @delete-cancelled="confirmingId = null"
/>
```

---

### MarkdownExporter.vue

**Props**:
- `sessionId` (string, required): Session ID to export events from

**Emits**:
- `export-success`: Emitted when clipboard copy succeeds
  - Payload: None
- `export-error`: Emitted when clipboard copy fails
  - Payload: `errorMessage` (string)

**Usage**:
```vue
<MarkdownExporter
  :sessionId="activeSession.id"
  @export-success="showSuccessToast"
  @export-error="showErrorToast"
/>
```

---

## Error Handling Convention

All composables follow this error handling pattern:

1. **Optimistic UI**: Update state immediately, rollback on error
2. **User-friendly messages**: Errors are human-readable, not stack traces
3. **Toast notifications**: Display via global toast service
4. **Console logging**: Log full error details to console for debugging

**Error Message Format**:
```
[Operation] failed: [User-friendly reason]

Examples:
- "Failed to create session: Session name cannot be empty"
- "Failed to delete event: Event not found"
- "Clipboard access denied. Please check browser permissions."
```

---

## TypeScript Type Exports

All types are exported from `/src/models/`:

```typescript
// src/models/Session.ts
export interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// src/models/Event.ts
export const EVENT_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export type EventTag = typeof EVENT_TAGS[number];

export interface Event {
  id: string;
  sessionId: string;
  tag: EventTag;
  timestamp: string;
  description: string;
}
```

Components import these types for prop validation and emit payloads.
