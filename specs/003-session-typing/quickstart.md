# Quickstart Guide: Session Type Classification

**Feature**: 003-session-typing
**Date**: 2025-11-18
**For**: Developers implementing this feature

## Overview

This guide provides step-by-step implementation instructions for adding session type classification to the GameSessionLogger application. Follow the phases in order to ensure smooth integration.

---

## Prerequisites

- Completed features: 001-event-logging, 002-i18n
- Node.js 18+ installed
- Familiarity with Vue 3 Composition API, TypeScript, Dexie.js

---

## Implementation Phases

### Phase 1: Data Model & Types (30 minutes)

#### Step 1.1: Create SessionType model

**File**: `src/models/SessionType.ts` (NEW)

```typescript
export const SESSION_TYPES = ['RPG', 'Boardgame'] as const;
export type SessionType = typeof SESSION_TYPES[number];

export function isValidSessionType(value: unknown): value is SessionType {
  return typeof value === 'string' && SESSION_TYPES.includes(value as SessionType);
}

export function normalizeSessionType(value: unknown): SessionType {
  return isValidSessionType(value) ? value : 'RPG';
}
```

**Test**: Run TypeScript compiler to verify no errors
```bash
npm run build
```

---

#### Step 1.2: Update Session model

**File**: `src/models/Session.ts` (MODIFY)

**Change**:
```typescript
import { SessionType } from './SessionType';  // ADD

export interface Session {
  id: string;
  name: string;
  type: SessionType;  // ADD
  createdAt: string;
  updatedAt: string;
}
```

**Test**: TypeScript compiler should catch any Session usages missing `type` field

---

#### Step 1.3: Update Event model for type-specific tags

**File**: `src/models/Event.ts` (MODIFY)

**Change**:
```typescript
// Replace EVENT_TAGS definition
export const RPG_TAGS = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'] as const;
export const BOARDGAME_TAGS = ['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other'] as const;

// Note: Scoring and Other appear in both, union will have 10 unique values
export const EVENT_TAGS = [...RPG_TAGS, ...BOARDGAME_TAGS] as const;
export type EventTag = typeof EVENT_TAGS[number];

// Keep existing isValidEventTag and validateEventDescription functions unchanged
```

**Test**: Verify types compile correctly
```bash
npm run build
```

---

#### Step 1.4: Create session type tags mapping utility

**File**: `src/utils/sessionTypeTags.ts` (NEW)

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

**Test**: Write unit test (optional)
```typescript
// tests/unit/utils/sessionTypeTags.spec.ts
import { describe, it, expect } from 'vitest';
import { getTagsForSessionType } from '@/utils/sessionTypeTags';

describe('getTagsForSessionType', () => {
  it('returns RPG tags for RPG type', () => {
    const tags = getTagsForSessionType('RPG');
    expect(tags).toEqual(['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other']);
  });

  it('returns Boardgame tags for Boardgame type', () => {
    const tags = getTagsForSessionType('Boardgame');
    expect(tags).toEqual(['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other']);
  });
});
```

Run tests:
```bash
npm test
```

---

### Phase 2: Database Migration (30 minutes)

#### Step 2.1: Update IndexedDB schema to v2

**File**: `src/services/db.ts` (MODIFY)

**Before**:
```typescript
export class GameSessionDatabase extends Dexie {
  sessions!: Dexie.Table<Session, string>;
  events!: Dexie.Table<Event, string>;

  constructor() {
    super('GameSessionLoggerDB');

    this.version(1).stores({
      sessions: 'id, createdAt',
      events: 'id, [sessionId+timestamp]'
    });
  }
}
```

**After**:
```typescript
import { normalizeSessionType } from '../models/SessionType';  // ADD

export class GameSessionDatabase extends Dexie {
  sessions!: Dexie.Table<Session, string>;
  events!: Dexie.Table<Event, string>;

  constructor() {
    super('GameSessionLoggerDB');

    // Keep v1 definition (required by Dexie)
    this.version(1).stores({
      sessions: 'id, createdAt',
      events: 'id, [sessionId+timestamp]'
    });

    // Add v2 with migration
    this.version(2).stores({
      sessions: 'id, type, createdAt',  // ADD type index
      events: 'id, [sessionId+timestamp]'  // Unchanged
    }).upgrade(async tx => {
      console.log('Migrating database to v2: adding session types');
      await tx.table('sessions').toCollection().modify(session => {
        if (!session.type) {
          session.type = 'RPG';  // Assign default type to existing sessions
          console.log(`Migrated session ${session.id} to RPG type`);
        }
      });
      console.log('Database migration to v2 complete');
    });
  }
}

export const db = new GameSessionDatabase();
```

**Test**: Clear IndexedDB and reload app to test migration
1. Open browser DevTools → Application → IndexedDB
2. Delete `GameSessionLoggerDB`
3. Create a test session in v1 (comment out v2 code temporarily)
4. Uncomment v2 code and reload
5. Verify session has `type: 'RPG'` in DevTools

---

### Phase 3: Composable Updates (20 minutes)

#### Step 3.1: Update useSessionStore

**File**: `src/composables/useSessionStore.ts` (MODIFY)

**Find** `createSession` function:
```typescript
async function createSession(name: string): Promise<Session> {
  // ... existing code
}
```

**Replace** with:
```typescript
import { SessionType, isValidSessionType } from '../models/SessionType';  // ADD

async function createSession(name: string, type: SessionType): Promise<Session> {
  const validation = validateSessionName(name);
  if (validation) {
    throw new Error(validation);
  }

  if (!isValidSessionType(type)) {
    throw new Error('Invalid session type');
  }

  const session: Session = {
    id: crypto.randomUUID(),
    name: name.trim(),
    type,  // ADD
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.sessions.add(session);
  sessions.value.push(session);
  return session;
}
```

**Also find** any session retrievals and add normalization:
```typescript
async function loadSessions() {
  const allSessions = await db.sessions.orderBy('createdAt').reverse().toArray();
  // ADD normalization for corrupted data
  sessions.value = allSessions.map(s => ({
    ...s,
    type: normalizeSessionType(s.type)
  }));
}
```

**Test**: Manually test session creation with both types in dev mode

---

### Phase 4: Component Updates (60 minutes)

#### Step 4.1: Update SessionSelector component

**File**: `src/components/SessionSelector.vue` (MODIFY)

**Update** script to handle type parameter:
```typescript
<script setup lang="ts">
import { ref } from 'vue';
import { SessionType } from '@/models/SessionType';  // ADD

// Existing refs
const newSessionName = ref('');
// Note: No newSessionType ref needed - type is passed directly via button click

const { createSession } = useSessionStore();
const { t } = useI18n();  // ADD for translations

async function handleCreateSession(type: SessionType) {  // CHANGED: Accept type parameter
  if (!newSessionName.value.trim()) {
    alert(t('session.nameRequired'));
    return;
  }

  try {
    await createSession(newSessionName.value, type);  // CHANGED: Pass type parameter
    newSessionName.value = '';  // Reset name only
  } catch (error) {
    alert(error.message);
  }
}

// ADD icon helper
function getSessionTypeIcon(type: SessionType): string {
  return type === 'RPG' ? '🎲' : '🎯';
}
</script>
```

**Update** template - add two dedicated type buttons:
```vue
<template>
  <!-- ... existing session list ... -->

  <!-- Create Session Form -->
  <div class="flex gap-2">
    <input
      v-model="newSessionName"
      type="text"
      :placeholder="$t('session.name')"
      maxlength="100"
      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <!-- ADD: Two dedicated type buttons with icons -->
    <button
      @click="handleCreateSession('RPG')"
      :disabled="!newSessionName.trim()"
      class="px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
      :title="$t('sessionType.addRpg')"
    >
      <span class="text-xl" role="img" :aria-label="$t('sessionType.rpg')">🎲</span>
    </button>

    <button
      @click="handleCreateSession('Boardgame')"
      :disabled="!newSessionName.trim()"
      class="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
      :title="$t('sessionType.addBoardgame')"
    >
      <span class="text-xl" role="img" :aria-label="$t('sessionType.boardgame')">🎯</span>
    </button>
  </div>
</template>
```

**Update** template - add icons to session list:
```vue
<template>
  <div class="session-list">
    <div
      v-for="session in sessions"
      :key="session.id"
      class="session-item"
      :class="{ active: session.id === currentSession?.id }"
      @click="selectSession(session.id)"
    >
      <!-- ADD: Type icon with tooltip -->
      <span
        class="session-type-icon"
        :title="t(`sessionType.${session.type.toLowerCase()}`)"
        role="img"
        :aria-label="t(`sessionType.${session.type.toLowerCase()}`)"
      >
        {{ getSessionTypeIcon(session.type) }}
      </span>

      <span class="session-name">{{ session.name }}</span>

      <!-- ... existing delete button ... -->
    </div>
  </div>
</template>
```

**Note on styles**: The example above uses Tailwind CSS classes (as per project standards). If you need custom styles for the session type icon, add:
```vue
<style scoped>
.session-type-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
  cursor: help;
}
</style>
```

**Test**:
1. Enter session name and click RPG button (🎲) → verify session created with RPG type and 🎲 icon appears in list
2. Enter session name and click Boardgame button (🎯) → verify session created with Boardgame type and 🎯 icon appears in list
3. Hover over session type icons in list → verify tooltip shows type name
4. Try clicking type button without entering name → verify buttons are disabled

---

#### Step 4.2: Update EventLogger component

**File**: `src/components/EventLogger.vue` (MODIFY)

**Import** tag utility:
```typescript
<script setup lang="ts">
import { computed } from 'vue';
import { getTagsForSessionType } from '@/utils/sessionTypeTags';  // ADD

// Existing props and composables
const { currentSession } = useSessionStore();
const { logEvent } = useEventStore();
const { t } = useI18n();

// ADD: Compute available tags based on session type
const availableTags = computed(() => {
  if (!currentSession.value) return [];
  return getTagsForSessionType(currentSession.value.type);
});
</script>
```

**Update** template to use computed tags:
```vue
<template>
  <div v-if="currentSession" class="event-logger">
    <div class="tag-buttons">
      <!-- CHANGE: Loop over availableTags instead of hardcoded array -->
      <button
        v-for="tag in availableTags"
        :key="tag"
        @click="handleLogEvent(tag)"
        class="tag-button"
      >
        {{ t(`eventTag.${tag.toLowerCase()}`) }}
      </button>
    </div>

    <!-- ... existing description input ... -->
  </div>
  <div v-else class="no-session">
    {{ t('event.noSessionSelected') }}
  </div>
</template>
```

**Test**:
1. Select RPG session → verify 6 buttons: Combat, Roleplay, Downtime, Scoring, Meal, Other
2. Select Boardgame session → verify 6 buttons: Setup, Turn, Round, Scoring, Teardown, Other
3. Switch between sessions → verify tags update in <1 second

---

### Phase 5: Internationalization (15 minutes)

#### Step 5.1: Add translation keys to English locale

**File**: `src/locales/en.json` (MODIFY)

**Add** under root object:
```json
{
  "sessionType": {
    "label": "Session Type",
    "rpg": "RPG",
    "boardgame": "Boardgame",
    "required": "Please select a session type",
    "addRpg": "Add RPG Session",
    "addBoardgame": "Add Boardgame Session"
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

---

#### Step 5.2: Add translation keys to French locale

**File**: `src/locales/fr.json` (MODIFY)

**Add** under root object:
```json
{
  "sessionType": {
    "label": "Type de session",
    "rpg": "JdR",
    "boardgame": "Jeu de plateau",
    "required": "Veuillez sélectionner un type de session",
    "addRpg": "Ajouter une session JdR",
    "addBoardgame": "Ajouter une session jeu de plateau"
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

**Test**:
1. Load app in English → verify labels are English
2. Switch to French → verify labels translate
3. Create session with French UI → verify type labels are French
4. Hover over icons → verify tooltips are French

---

### Phase 6: Testing & Validation (30 minutes)

#### Step 6.1: Manual testing checklist

- [ ] Create RPG session
  - [ ] Two type buttons (🎲 RPG and 🎯 Boardgame) visible in form
  - [ ] RPG button disabled when no session name entered
  - [ ] Enter name and click RPG button → session created with RPG type
  - [ ] Icon 🎲 appears in session list
  - [ ] Tooltip shows "RPG" on hover
  - [ ] Event tags: Combat, Roleplay, Downtime, Scoring, Meal, Other

- [ ] Create Boardgame session
  - [ ] Boardgame button disabled when no session name entered
  - [ ] Enter name and click Boardgame button → session created with Boardgame type
  - [ ] Icon 🎯 appears in session list
  - [ ] Tooltip shows "Boardgame" on hover
  - [ ] Event tags: Setup, Turn, Round, Scoring, Teardown, Other

- [ ] Switch between sessions
  - [ ] Event tags update to match session type
  - [ ] Update happens in <1 second
  - [ ] No visual glitches during transition

- [ ] Database migration
  - [ ] Existing sessions show RPG icon after upgrade
  - [ ] Existing sessions have type='RPG' in IndexedDB
  - [ ] No data loss during migration

- [ ] Internationalization
  - [ ] English labels display correctly
  - [ ] French labels display correctly
  - [ ] Language switching updates all type labels
  - [ ] Tooltips translate with language

- [ ] Edge cases
  - [ ] Manually corrupt session type in DevTools → normalizes to RPG
  - [ ] Refresh page → session types persist
  - [ ] Close/reopen browser → session types persist

---

#### Step 6.2: Automated tests (optional)

**Unit tests**: See `contracts/component-contracts.md` for test examples

**E2E tests**: Create `tests/e2e/session-typing.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('user can create RPG session and see RPG tags', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Create RPG session
  await page.fill('input[placeholder*="Session"]', 'My RPG Game');
  await page.click('button[title*="RPG"]'); // Click RPG button with 🎲 icon

  // Verify icon
  await expect(page.locator('.session-type-icon').first()).toHaveText('🎲');

  // Verify tags
  await expect(page.locator('button:has-text("Combat")')).toBeVisible();
  await expect(page.locator('button:has-text("Roleplay")')).toBeVisible();
});

test('user can create Boardgame session and see Boardgame tags', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Create Boardgame session
  await page.fill('input[placeholder*="Session"]', 'My Board Game');
  await page.click('button[title*="Boardgame"]'); // Click Boardgame button with 🎯 icon

  // Verify icon
  await expect(page.locator('.session-type-icon').first()).toHaveText('🎯');

  // Verify tags
  await expect(page.locator('button:has-text("Setup")')).toBeVisible();
  await expect(page.locator('button:has-text("Turn")')).toBeVisible();
});
```

Run E2E tests:
```bash
npm run test:e2e
```

---

### Phase 7: Code Review & Documentation (15 minutes)

#### Step 7.1: Self-review checklist

- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied to all modified files
- [ ] No console.logs left in production code (except migration logs)
- [ ] No commented-out code
- [ ] All TODOs addressed or documented

Run checks:
```bash
npm run build
npm run lint
npm run format
```

---

#### Step 7.2: Update CLAUDE.md (automatic)

**File**: `CLAUDE.md` (MODIFY)

This file will be automatically updated by the `/speckit.implement` command. No manual action required.

---

## Common Issues & Troubleshooting

### Issue 1: TypeScript error "Property 'type' does not exist on Session"

**Cause**: Session model not updated in all files
**Fix**: Search for `Session` interface/type usage, ensure all have `type: SessionType`
```bash
grep -r "interface Session" src/
grep -r "type Session" src/
```

### Issue 2: Migration doesn't run

**Cause**: Database version already at v2
**Fix**: Delete IndexedDB and reload
1. DevTools → Application → IndexedDB
2. Right-click `GameSessionLoggerDB` → Delete
3. Reload page

### Issue 3: Tags don't update when switching sessions

**Cause**: `computed()` not reactive to session change
**Fix**: Ensure `availableTags` uses `currentSession.value.type` (with `.value`)
```typescript
// CORRECT
const availableTags = computed(() => {
  if (!currentSession.value) return [];
  return getTagsForSessionType(currentSession.value.type);
});

// WRONG (missing .value)
const availableTags = computed(() => {
  if (!currentSession) return [];
  return getTagsForSessionType(currentSession.type);
});
```

### Issue 4: Translations not showing

**Cause**: Translation keys not added to locale files or typo in key path
**Fix**: Verify keys exist in both `en.json` and `fr.json`
```bash
# Check if keys exist
grep "sessionType" src/locales/en.json
grep "sessionType" src/locales/fr.json
```

### Issue 5: Icons not rendering

**Cause**: Emoji not supported in browser or OS font
**Fix**: Test in target browsers (Chrome 90+, Firefox 88+, Safari 14+). Emoji 🎲 and 🎯 are Unicode 6.0 (widely supported).

---

## Performance Optimization Tips

1. **Use `computed()` for tag list**: Memoizes result, only recomputes when session type changes
2. **Avoid unnecessary re-renders**: Use `v-memo` on session list items if list is large (100+ sessions)
3. **IndexedDB indexing**: `type` field indexed for future filtering features (no performance cost now)
4. **Bundle size**: No new dependencies added, total increase <5KB gzipped

---

## Next Steps

After completing implementation:

1. **Test thoroughly** using manual and automated test checklists
2. **Create pull request** with descriptive title and summary of changes
3. **Request code review** from team member (verify constitution compliance)
4. **Merge to main** after approval and passing CI checks
5. **Deploy to production** and monitor for errors
6. **Update user documentation** if end-user guide exists

---

## Resources

- [Dexie.js Schema Versioning](https://dexie.org/docs/Tutorial/Design#database-versioning)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [vue-i18n Guide](https://vue-i18n.intlify.dev/guide/)
- [TypeScript Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)

---

**Quickstart Complete**: 2025-11-18
**Estimated Implementation Time**: 3.5 hours
**Next Command**: `/speckit.tasks` to generate detailed task breakdown
