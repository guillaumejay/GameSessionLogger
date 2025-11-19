# Component Contracts: Session Type Classification

**Feature**: 003-session-typing
**Date**: 2025-11-18
**Type**: Vue 3 Component Interfaces

## Overview

This document defines the contracts (props, emits, exposed methods) for Vue 3 components modified or created for the session type classification feature.

---

## Modified Components

### SessionSelector.vue

**Purpose**: Create, select, and switch between sessions with type classification

**Props**: None (uses composables for state management)

**Emits**:

| Event | Payload | Description |
|-------|---------|-------------|
| `session-created` | `{ session: Session }` | Fired when a new session is created |
| `session-selected` | `{ session: Session }` | Fired when user selects a different session |
| `session-deleted` | `{ sessionId: string }` | Fired when user confirms session deletion |

**Exposed Methods**: None (component uses internal reactive state)

**Template Structure** (Modifications):

```vue
<template>
  <!-- Session List -->
  <div class="session-list">
    <div
      v-for="session in sessions"
      :key="session.id"
      class="session-item"
      @click="selectSession(session)"
    >
      <!-- NEW: Session type icon with tooltip -->
      <span
        class="session-type-icon"
        :title="$t(`sessionType.${session.type.toLowerCase()}`)"
        role="img"
        :aria-label="$t(`sessionType.${session.type.toLowerCase()}`)"
      >
        {{ getSessionTypeIcon(session.type) }}
      </span>

      <span class="session-name">{{ session.name }}</span>

      <!-- ... existing delete button -->
    </div>
  </div>

  <!-- Create Session Form -->
  <form @submit.prevent="handleCreateSession">
    <input
      v-model="newSessionName"
      type="text"
      :placeholder="$t('session.namePlaceholder')"
      required
      maxlength="100"
    />

    <!-- NEW: Session type selector (mandatory) -->
    <select
      v-model="newSessionType"
      required
      :aria-label="$t('sessionType.label')"
    >
      <option value="">{{ $t('sessionType.label') }}</option>
      <option value="RPG">{{ $t('sessionType.rpg') }}</option>
      <option value="Boardgame">{{ $t('sessionType.boardgame') }}</option>
    </select>

    <button type="submit">{{ $t('session.create') }}</button>
  </form>
</template>
```

**Reactive State** (Modifications):

```typescript
const newSessionType = ref<SessionType | ''>('');  // NEW: default empty for validation
```

**Validation**:
- Form submission blocked if `newSessionType === ''`
- Browser native `required` attribute enforces selection
- Error message displayed if validation fails: `$t('sessionType.required')`

**Behavior Changes**:
1. **Session Creation**: Now includes type field, mandatory selection enforced
2. **Session Display**: Icons added to each session list item with hover tooltips
3. **Session Selection**: No changes, existing behavior preserved

---

### EventLogger.vue

**Purpose**: Display session-specific event tag buttons and log events

**Props**:

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentSession` | `Session \| null` | No | `null` | Active session (determines available tags) |

**Emits**:

| Event | Payload | Description |
|-------|---------|-------------|
| `event-logged` | `{ event: Event }` | Fired when user logs a new event |

**Exposed Methods**: None

**Template Structure** (Modifications):

```vue
<template>
  <div v-if="currentSession" class="event-logger">
    <!-- Event Tag Buttons (dynamic based on session type) -->
    <div class="tag-buttons">
      <button
        v-for="tag in availableTags"
        :key="tag"
        @click="logEvent(tag)"
        :aria-label="$t(`eventTag.${tag.toLowerCase()}`)"
      >
        {{ $t(`eventTag.${tag.toLowerCase()}`) }}
      </button>
    </div>

    <!-- Optional Description Field -->
    <input
      v-model="eventDescription"
      type="text"
      :placeholder="$t('event.descriptionPlaceholder')"
      maxlength="500"
    />
  </div>
  <div v-else class="no-session-message">
    {{ $t('event.noSessionSelected') }}
  </div>
</template>
```

**Computed Properties** (NEW):

```typescript
const availableTags = computed((): readonly EventTag[] => {
  if (!props.currentSession) return [];
  return getTagsForSessionType(props.currentSession.type);
});
```

**Behavior Changes**:
1. **Tag Buttons**: Dynamically rendered based on current session's type
2. **Tag Count**: 6 buttons always displayed (both RPG and Boardgame have 6 tags)
3. **Switching Sessions**: Tags update automatically when `currentSession` prop changes

**Performance**:
- `computed()` memoizes tag list, only recomputes when session type changes
- Expected recomputation time: <1ms (simple array lookup)

---

## New Components

None. This feature modifies existing components only.

---

## Composables Contracts

### useSessionStore

**Purpose**: Manage session CRUD operations with IndexedDB

**Type Signature** (Modifications):

```typescript
export function useSessionStore() {
  return {
    sessions: Ref<Session[]>,           // All sessions
    currentSession: Ref<Session | null>, // Active session

    // MODIFIED: Now accepts type parameter
    createSession: (name: string, type: SessionType) => Promise<Session>,

    // Unchanged methods
    loadSessions: () => Promise<void>,
    selectSession: (sessionId: string) => Promise<void>,
    deleteSession: (sessionId: string) => Promise<void>,
  };
}
```

**Method Changes**:

#### createSession (MODIFIED)

**Before**:
```typescript
async function createSession(name: string): Promise<Session>
```

**After**:
```typescript
async function createSession(name: string, type: SessionType): Promise<Session>
```

**Behavior**:
- Validates `name` using existing `validateSessionName()`
- Validates `type` using `isValidSessionType()`
- Generates UUID for `id`
- Sets `createdAt` and `updatedAt` to current ISO 8601 timestamp
- Inserts session into IndexedDB `sessions` table
- Adds session to `sessions` reactive array
- Returns created session

**Error Handling**:
- Throws error if validation fails
- Throws error if IndexedDB insertion fails
- Caller responsible for displaying error to user

---

### useEventStore

**Purpose**: Manage event CRUD operations with IndexedDB

**Type Signature**: No changes required

**Behavior Impact**:
- Events can still be logged with any valid `EventTag`
- UI enforcement (EventLogger) prevents logging invalid tags for session type
- Database schema unchanged (events do not store session type directly)

---

## Utility Functions Contracts

### getTagsForSessionType

**File**: `utils/sessionTypeTags.ts`

**Signature**:
```typescript
function getTagsForSessionType(type: SessionType): readonly EventTag[]
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `type` | `SessionType` | Session type ('RPG' or 'Boardgame') |

**Returns**:
- For `'RPG'`: `['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other']`
- For `'Boardgame'`: `['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other']`

**Guarantees**:
- Always returns a non-empty array (both types have 6 tags)
- Array is readonly (cannot be mutated)
- O(1) lookup time (direct object access)

**Usage**:
```typescript
import { getTagsForSessionType } from '@/utils/sessionTypeTags';

const tags = getTagsForSessionType(session.type);
// tags: readonly EventTag[]
```

---

### isValidSessionType

**File**: `models/SessionType.ts`

**Signature**:
```typescript
function isValidSessionType(value: unknown): value is SessionType
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `value` | `unknown` | Value to validate |

**Returns**: `true` if value is 'RPG' or 'Boardgame', `false` otherwise

**Type Guard**: Narrows `value` to `SessionType` when returns `true`

**Usage**:
```typescript
if (isValidSessionType(userInput)) {
  // TypeScript knows userInput is SessionType here
  const tags = getTagsForSessionType(userInput);
}
```

---

### normalizeSessionType

**File**: `models/SessionType.ts`

**Signature**:
```typescript
function normalizeSessionType(value: unknown): SessionType
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `value` | `unknown` | Value to normalize |

**Returns**: `value` if valid, otherwise `'RPG'` (default)

**Guarantees**:
- Always returns a valid `SessionType`
- Never throws an error
- Idempotent: `normalizeSessionType(normalizeSessionType(x)) === normalizeSessionType(x)`

**Usage**:
```typescript
// Safe to use with potentially corrupted data
const session = await db.sessions.get(id);
const safeType = normalizeSessionType(session?.type);
```

---

## Database Contracts

### IndexedDB Schema v2

**Database**: `GameSessionLoggerDB`
**Version**: 2

**Upgrade Contract**:
```typescript
db.version(2).stores({
  sessions: 'id, type, createdAt',
  events: 'id, [sessionId+timestamp]'
}).upgrade(async tx => {
  await tx.table('sessions').toCollection().modify(session => {
    if (!session.type) {
      session.type = 'RPG';
    }
  });
});
```

**Guarantees**:
- Migration runs once on first load after upgrade
- All existing sessions assigned `'RPG'` type
- No data loss during migration
- Idempotent: safe to call multiple times (checks `if (!session.type)`)

**Error Handling**:
- If migration fails, Dexie throws error
- Application catches error and displays user-friendly message
- User prompted to reload application

---

## Internationalization Contracts

### Translation Keys

**File**: `locales/en.json`, `locales/fr.json`

**Required Keys**:

```json
{
  "sessionType": {
    "label": "Session Type",
    "rpg": "RPG",
    "boardgame": "Boardgame",
    "required": "Please select a session type"
  },
  "eventTag": {
    "combat": "Combat",
    "roleplay": "Roleplay",
    "downtime": "Downtime",
    "scoring": "Scoring",
    "meal": "Meal",
    "other": "Other",
    "setup": "Setup",
    "turn": "Turn",
    "round": "Round",
    "teardown": "Teardown"
  }
}
```

**French Translations**:

```json
{
  "sessionType": {
    "label": "Type de session",
    "rpg": "JdR",
    "boardgame": "Jeu de plateau",
    "required": "Veuillez sélectionner un type de session"
  },
  "eventTag": {
    "combat": "Combat",
    "roleplay": "Jeu de rôle",
    "downtime": "Temps libre",
    "scoring": "Score",
    "meal": "Repas",
    "other": "Autre",
    "setup": "Mise en place",
    "turn": "Tour",
    "round": "Manche",
    "teardown": "Rangement"
  }
}
```

**Contract**:
- All keys must exist in both `en.json` and `fr.json`
- Keys accessed via `$t()` in templates or `t()` in scripts
- Missing keys display key path as fallback (vue-i18n default)

---

## Testing Contracts

### Component Tests

**SessionSelector.vue Tests**:

```typescript
describe('SessionSelector', () => {
  it('should require session type selection', async () => {
    // Arrange
    const wrapper = mount(SessionSelector);
    const nameInput = wrapper.find('input[type="text"]');
    const typeSelect = wrapper.find('select');
    const form = wrapper.find('form');

    // Act
    await nameInput.setValue('Test Session');
    await form.trigger('submit');

    // Assert
    expect(typeSelect.element.validity.valid).toBe(false);
    expect(wrapper.emitted('session-created')).toBeUndefined();
  });

  it('should create session with selected type', async () => {
    // Arrange
    const wrapper = mount(SessionSelector);
    const nameInput = wrapper.find('input[type="text"]');
    const typeSelect = wrapper.find('select');
    const form = wrapper.find('form');

    // Act
    await nameInput.setValue('Test Session');
    await typeSelect.setValue('RPG');
    await form.trigger('submit');

    // Assert
    expect(wrapper.emitted('session-created')).toBeTruthy();
    const event = wrapper.emitted('session-created')[0][0];
    expect(event.session.type).toBe('RPG');
  });

  it('should display type icon with tooltip', () => {
    // Arrange
    const session = { id: '1', name: 'Test', type: 'RPG', ... };
    const wrapper = mount(SessionSelector, {
      global: { stubs: { useSessionStore: () => ({ sessions: [session] }) } }
    });

    // Assert
    const icon = wrapper.find('.session-type-icon');
    expect(icon.attributes('title')).toBe('RPG');
    expect(icon.attributes('aria-label')).toBe('RPG');
  });
});
```

**EventLogger.vue Tests**:

```typescript
describe('EventLogger', () => {
  it('should display RPG tags for RPG session', () => {
    // Arrange
    const session = { id: '1', name: 'Test', type: 'RPG', ... };
    const wrapper = mount(EventLogger, { props: { currentSession: session } });

    // Assert
    const buttons = wrapper.findAll('.tag-buttons button');
    expect(buttons).toHaveLength(6);
    expect(buttons.map(b => b.text())).toEqual(['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other']);
  });

  it('should display Boardgame tags for Boardgame session', () => {
    // Arrange
    const session = { id: '1', name: 'Test', type: 'Boardgame', ... };
    const wrapper = mount(EventLogger, { props: { currentSession: session } });

    // Assert
    const buttons = wrapper.findAll('.tag-buttons button');
    expect(buttons).toHaveLength(6);
    expect(buttons.map(b => b.text())).toEqual(['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other']);
  });

  it('should update tags when session changes', async () => {
    // Arrange
    const rpgSession = { id: '1', name: 'RPG Game', type: 'RPG', ... };
    const bgSession = { id: '2', name: 'Board Game', type: 'Boardgame', ... };
    const wrapper = mount(EventLogger, { props: { currentSession: rpgSession } });

    // Act
    await wrapper.setProps({ currentSession: bgSession });

    // Assert
    const buttons = wrapper.findAll('.tag-buttons button');
    expect(buttons.map(b => b.text())).toEqual(['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other']);
  });
});
```

---

## Backwards Compatibility

### Existing Data
- All existing sessions automatically migrated to `'RPG'` type
- No manual user action required
- Existing event logging behavior unchanged

### API Compatibility
- `createSession()` signature changed: **BREAKING CHANGE**
  - Before: `createSession(name: string)`
  - After: `createSession(name: string, type: SessionType)`
  - Impact: All callers must be updated to pass `type` parameter

### Component Compatibility
- **SessionSelector**: Internal changes only, no prop/emit changes → **COMPATIBLE**
- **EventLogger**: New `currentSession` prop (optional) → **COMPATIBLE** (defaults to `null`)
- **EventList**: No changes → **FULLY COMPATIBLE**
- **EventCard**: No changes → **FULLY COMPATIBLE**

---

**Contracts Complete**: 2025-11-18
**Next Steps**: Generate quickstart guide
