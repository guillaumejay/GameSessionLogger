# Data Model: Session Type Classification

**Feature**: 003-session-typing
**Date**: 2025-11-18
**Status**: Complete

## Overview

This document defines the data model extensions for session type classification. The feature adds a `type` attribute to the Session entity and introduces new types and utilities to support type-specific event tags.

---

## Entities

### Session (Modified)

Represents a game session with metadata including type classification.

**Attributes**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | Auto-generated UUID | Unique identifier |
| name | string | Yes | None | User-provided session name (1-100 chars) |
| type | SessionType | Yes | 'RPG' (migration) | Session classification: 'RPG' or 'Boardgame' |
| createdAt | string | Yes | ISO 8601 timestamp | Session creation timestamp |
| updatedAt | string | Yes | ISO 8601 timestamp | Last modification timestamp |

**TypeScript Definition**:
```typescript
import { SessionType } from './SessionType';

export interface Session {
  id: string;
  name: string;
  type: SessionType;          // NEW FIELD
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}
```

**Validation Rules**:
- `name`: Must be non-empty after trim, max 100 characters
- `type`: Must be one of: 'RPG' | 'Boardgame'
- `id`: Must be unique across all sessions
- `createdAt`, `updatedAt`: Must be valid ISO 8601 strings

**State Transitions**:
- **Created**: User submits session creation form with name and type → Session record inserted into IndexedDB
- **Selected**: User clicks session in list → Session becomes active context
- **Updated**: User edits session name → `updatedAt` timestamp refreshed
- **Deleted**: User confirms deletion → Session and all related events removed from IndexedDB

**Relationships**:
- One Session has many Events (one-to-many)
- Session.type determines available EventTag values (via mapping)

**Indexes** (IndexedDB):
- Primary key: `id`
- Compound index: `type, createdAt` (for future filtering/sorting by type)

---

### SessionType (New Type)

Union literal type representing the classification of a session.

**Type Definition**:
```typescript
export const SESSION_TYPES = ['RPG', 'Boardgame'] as const;
export type SessionType = typeof SESSION_TYPES[number];
// Resolves to: 'RPG' | 'Boardgame'
```

**Valid Values**:
- `'RPG'`: Role-playing game session
- `'Boardgame'`: Board game session

**Validation**:
```typescript
export function isValidSessionType(value: unknown): value is SessionType {
  return typeof value === 'string' && SESSION_TYPES.includes(value as SessionType);
}
```

**Normalization** (for corrupted/invalid data):
```typescript
export function normalizeSessionType(value: unknown): SessionType {
  return isValidSessionType(value) ? value : 'RPG';
}
```

**Usage**:
- Session creation: User selects from dropdown (mandatory)
- Session display: Determines icon and tooltip text
- Event logging: Determines available tag list

---

### Event (Modified - Indirectly)

Event entity is not structurally modified, but the available `tag` values are now determined by the parent Session's `type` attribute.

**No Schema Changes Required**:
```typescript
export interface Event {
  id: string;
  sessionId: string;
  tag: EventTag;           // Available values depend on session.type
  timestamp: string;       // ISO 8601
  description: string;
}
```

**Tag Value Constraints** (enforced at application layer):
- **RPG Sessions**: tag must be one of `['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other']`
- **Boardgame Sessions**: tag must be one of `['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other']`

**Validation**:
- Existing `isValidEventTag()` function remains unchanged
- New utility `getTagsForSessionType()` returns valid tags for a given session type
- UI only displays valid tags based on current session type (no invalid values possible)

---

## Type Definitions

### EventTag (Modified)

The EventTag type now represents the union of all possible tags across all session types.

**Current Definition** (from feature 001):
```typescript
export const EVENT_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export type EventTag = typeof EVENT_TAGS[number];
```

**Modified Definition** (feature 003):
```typescript
export const RPG_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export const BOARDGAME_TAGS = ['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other'] as const;
export const EVENT_TAGS = [...RPG_TAGS, ...BOARDGAME_TAGS] as const;
export type EventTag = typeof EVENT_TAGS[number];
// Resolves to: 'Combat' | 'Roleplay' | 'Downtime' | 'Scoring' | 'Meal' | 'Other' | 'Setup' | 'Turn' | 'Round' | 'Teardown'
```

**Note**: 'Scoring' and 'Other' appear in both tag lists, so the union contains 10 unique values.

---

## Mapping and Utilities

### SessionType → EventTag[] Mapping

Centralized mapping that defines which tags are available for each session type.

**File**: `utils/sessionTypeTags.ts`

**Implementation**:
```typescript
import { SessionType } from '../models/SessionType';
import { RPG_TAGS, BOARDGAME_TAGS, EventTag } from '../models/Event';

type TagsByType = Record<SessionType, readonly EventTag[]>;

export const SESSION_TYPE_TAGS: TagsByType = {
  RPG: RPG_TAGS,
  Boardgame: BOARDGAME_TAGS,
} as const;

export function getTagsForSessionType(type: SessionType): readonly EventTag[] {
  return SESSION_TYPE_TAGS[type];
}
```

**Usage**:
```typescript
// In EventLogger.vue
const currentSession = useSessionStore().currentSession;
const availableTags = computed(() =>
  currentSession.value ? getTagsForSessionType(currentSession.value.type) : []
);
```

---

## Database Schema

### IndexedDB Schema v2

**Database Name**: `GameSessionLoggerDB`
**Version**: 2 (upgrade from v1)

**Tables**:

#### sessions
```typescript
{
  keyPath: 'id',
  indexes: [
    'id',           // Primary key (unique)
    'type',         // NEW: For filtering by type (future feature)
    'createdAt'     // For sorting by creation date
  ]
}
```

#### events
```typescript
{
  keyPath: 'id',
  indexes: [
    'id',                   // Primary key (unique)
    '[sessionId+timestamp]' // Compound index for efficient querying
  ]
}
```

**Migration Logic** (v1 → v2):
```typescript
this.version(2).stores({
  sessions: 'id, type, createdAt',
  events: 'id, [sessionId+timestamp]'
}).upgrade(tx => {
  return tx.table('sessions').toCollection().modify(session => {
    if (!session.type) {
      session.type = 'RPG';  // Assign default type to existing sessions
    }
  });
});
```

**Migration Behavior**:
- All existing sessions without `type` field automatically assigned `'RPG'`
- Migration runs once on first application load after upgrade
- Idempotent: safe to run multiple times (checks `if (!session.type)`)
- No data loss: existing fields preserved, only `type` added

---

## Validation Rules

### Session Validation

**Function**: `validateSession(session: Partial<Session>): string | null`

**Rules**:
1. `name` must be non-empty after trimming
2. `name` must be ≤ 100 characters
3. `type` must be a valid SessionType ('RPG' or 'Boardgame')
4. `id` must be unique (enforced by IndexedDB primary key)
5. `createdAt` and `updatedAt` must be valid ISO 8601 strings

**Implementation**:
```typescript
export function validateSession(session: Partial<Session>): string | null {
  if (!session.name || session.name.trim().length === 0) {
    return 'Session name cannot be empty';
  }
  if (session.name.trim().length > 100) {
    return 'Session name must be 100 characters or less';
  }
  if (!session.type || !isValidSessionType(session.type)) {
    return 'Invalid session type';
  }
  return null;
}
```

### Session Type Validation

**Function**: `isValidSessionType(value: unknown): value is SessionType`

**Rules**:
1. Value must be a string
2. Value must be one of: 'RPG', 'Boardgame'

**Implementation**: See SessionType definition above

---

## Data Integrity Constraints

### At Creation Time
- Session type MUST be selected (UI prevents submission without selection)
- Session name MUST pass validation
- Unique ID generated (UUID v4)
- Timestamps auto-generated (ISO 8601 format)

### At Runtime
- Invalid session types normalized to 'RPG' (graceful degradation)
- Events can only be logged with tags valid for current session type (UI enforces this)
- Session type is immutable after creation (out of scope for editing)

### At Migration Time
- All existing sessions assigned 'RPG' type (backward compatibility)
- Migration is idempotent (safe to run multiple times)
- No data loss during upgrade

---

## Edge Cases and Error Handling

### Case 1: Session with Missing Type Field
**Scenario**: IndexedDB corruption or manual database edit removes `type` field
**Handling**: `normalizeSessionType()` returns 'RPG'
**User Impact**: Session displays as RPG, functions normally

### Case 2: Session with Invalid Type Value
**Scenario**: Manual database edit sets `type` to 'Unknown'
**Handling**: `normalizeSessionType()` returns 'RPG'
**User Impact**: Session displays as RPG, functions normally

### Case 3: Migration Failure
**Scenario**: IndexedDB quota exceeded during migration
**Handling**: Dexie throws error, application catches and displays user-friendly message
**User Impact**: User prompted to free up space and reload

### Case 4: Type Selection Not Made
**Scenario**: User tries to create session without selecting type
**Handling**: Form validation prevents submission, displays error message
**User Impact**: Cannot create session until type is selected

---

## Performance Characteristics

### Read Operations
- **Session retrieval**: O(1) via primary key lookup
- **Session list**: O(n log n) sorted by `createdAt` index
- **Tag list lookup**: O(1) constant-time object access

### Write Operations
- **Session creation**: O(1) IndexedDB insert
- **Session update**: O(1) IndexedDB update by primary key
- **Migration**: O(n) single pass over all sessions (runs once)

### Memory Footprint
- **Session object**: ~150 bytes (id: 36, name: ~20, type: 10, timestamps: 50)
- **Tag mapping**: ~200 bytes (2 arrays of 6 strings each)
- **Total overhead**: <5KB for type system

---

## Future Extensibility

### Adding New Session Types
**Steps**:
1. Add new type to `SESSION_TYPES` array
2. Define tag list for new type in `Event.ts`
3. Add mapping entry in `SESSION_TYPE_TAGS`
4. Add translation keys to locale files
5. Choose icon emoji for new type
6. No database migration required (type field already supports strings)

**Example** (future "Wargame" type):
```typescript
export const SESSION_TYPES = ['RPG', 'Boardgame', 'Wargame'] as const;
export const WARGAME_TAGS = ['Deployment', 'Movement', 'Combat', 'Morale', 'Victory', 'Other'] as const;

export const SESSION_TYPE_TAGS: TagsByType = {
  RPG: RPG_TAGS,
  Boardgame: BOARDGAME_TAGS,
  Wargame: WARGAME_TAGS,
};
```

### Custom Tags Per Session (Future Enhancement)
**Approach**: Add optional `customTags` array field to Session model
**Migration**: Default to `null` or `[]` for existing sessions
**UI**: Toggle between predefined tags and custom tag input

---

## Testing Scenarios

### Unit Tests
- ✓ `isValidSessionType('RPG')` returns `true`
- ✓ `isValidSessionType('Invalid')` returns `false`
- ✓ `normalizeSessionType('Boardgame')` returns `'Boardgame'`
- ✓ `normalizeSessionType('Corrupted')` returns `'RPG'`
- ✓ `getTagsForSessionType('RPG')` returns RPG tags
- ✓ `getTagsForSessionType('Boardgame')` returns Boardgame tags
- ✓ `validateSession({name: '', type: 'RPG'})` returns error
- ✓ `validateSession({name: 'Test', type: 'Invalid'})` returns error

### Integration Tests
- ✓ Create session with type 'RPG' → stored correctly in IndexedDB
- ✓ Create session with type 'Boardgame' → stored correctly in IndexedDB
- ✓ Migration assigns 'RPG' to sessions without type field
- ✓ Retrieve session with missing type → normalized to 'RPG'

### E2E Tests
- ✓ User creates RPG session → sees RPG icon and RPG tags
- ✓ User creates Boardgame session → sees Boardgame icon and Boardgame tags
- ✓ User switches sessions → tag list updates accordingly
- ✓ User hovers over icon → tooltip shows session type name

---

**Data Model Complete**: 2025-11-18
**Next Steps**: Generate contracts and quickstart guide
