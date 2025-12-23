# Data Model: Event Duration Tracking

**Feature**: 004-event-duration
**Date**: 2025-12-04

## Entity Changes

### Event (Updated)

The Event entity is extended with an optional `endTimestamp` field.

#### Current Schema (v2)

```typescript
interface Event {
  id: string;           // UUID, primary key
  sessionId: string;    // Foreign key to Session
  tag: EventTag;        // 'Combat' | 'Roleplay' | ... union type
  timestamp: string;    // ISO 8601 start time
  description: string;  // User-entered text, max 500 chars
}
```

#### New Schema (v3)

```typescript
interface Event {
  id: string;                    // UUID, primary key
  sessionId: string;             // Foreign key to Session
  tag: EventTag;                 // 'Combat' | 'Roleplay' | ... union type
  timestamp: string;             // ISO 8601 start time
  endTimestamp?: string;         // ISO 8601 end time (optional, null = open)
  description: string;           // User-entered text, max 500 chars
}
```

#### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | UUID generated via `crypto.randomUUID()` |
| `sessionId` | `string` | Yes | References parent Session |
| `tag` | `EventTag` | Yes | Category tag (Combat, Setup, etc.) |
| `timestamp` | `string` | Yes | ISO 8601 datetime when event started |
| `endTimestamp` | `string` | No | ISO 8601 datetime when event closed (null = open) |
| `description` | `string` | Yes | Event description (may be empty string) |

#### Derived Properties

These are computed at runtime, not stored:

| Property | Type | Derivation |
|----------|------|------------|
| `isOpen` | `boolean` | `endTimestamp === undefined \|\| endTimestamp === null` |
| `isClosed` | `boolean` | `!isOpen` |
| `durationMs` | `number \| null` | `isClosed ? Date.parse(endTimestamp) - Date.parse(timestamp) : null` |

## Database Migration

### Dexie Schema v3

```typescript
// In db.ts
this.version(3).stores({
  sessions: 'id, type, createdAt',
  events: 'id, [sessionId+timestamp]'  // No change to indexes
});
// No upgrade function needed - endTimestamp is optional
```

**Note**: Dexie automatically handles the new optional field. Existing events will have `endTimestamp: undefined`.

## State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                       Event States                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌────────┐     closeEvent()      ┌────────┐              │
│   │  OPEN  │ ─────────────────────▶│ CLOSED │              │
│   └────────┘                       └────────┘              │
│       │                                                     │
│       │ createEvent() on another event                      │
│       │ (auto-close)                                        │
│       ▼                                                     │
│   ┌────────┐                                               │
│   │ CLOSED │                                               │
│   └────────┘                                               │
│                                                             │
│   States are derived from endTimestamp:                     │
│   - OPEN: endTimestamp is null/undefined                    │
│   - CLOSED: endTimestamp has ISO 8601 value                 │
│                                                             │
│   Note: State transitions are one-way (OPEN → CLOSED)       │
│   No mechanism to reopen a closed event.                    │
└─────────────────────────────────────────────────────────────┘
```

## Validation Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| `endTimestamp >= timestamp` | End time cannot precede start time | Runtime check in `closeEvent()` |
| Single open event per session | Only most recent event can be open | Enforced by auto-close on `createEvent()` |
| `endTimestamp` format | Must be valid ISO 8601 string | Use `new Date().toISOString()` |

## Backward Compatibility

| Scenario | Behavior |
|----------|----------|
| Legacy event (no `endTimestamp`) | Treated as closed, duration displays "—" |
| Legacy event with `endTimestamp: null` | Same as above |
| New open event | `endTimestamp: undefined`, duration displays "Ongoing" |
| New closed event | `endTimestamp` set, duration calculated and displayed |

## Utility Types

```typescript
// Duration display result
type DurationDisplay =
  | { type: 'ongoing' }                    // Open event
  | { type: 'unknown' }                    // Legacy event, no end time
  | { type: 'duration'; formatted: string } // Closed event with duration

// Helper function signature
function formatEventDuration(event: Event): DurationDisplay;
```
