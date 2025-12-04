# Tasks: Event Duration Tracking

**Input**: Design documents from `/specs/004-event-duration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in feature specification (optional per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Vue SPA)

---

## Phase 1: Setup

**Purpose**: No setup needed - existing project structure

This feature extends an existing project. No new project initialization required.

**Checkpoint**: Ready to proceed to foundational phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Add `endTimestamp?: string` field to Event interface in `src/models/Event.ts`
- [x] T002 [P] Add Dexie v3 schema migration in `src/services/db.ts`
- [x] T003 [P] Create duration formatting utility with `formatDuration()` function in `src/utils/duration.ts`
- [x] T004 [P] Add i18n keys for close button and duration labels in `src/locales/en.json`
- [x] T005 [P] Add i18n keys for close button and duration labels in `src/locales/fr.json`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Close Event with Dedicated Button (Priority: P1) MVP

**Goal**: Users can manually close an open event using a "Close [Tag]" button, which records the end timestamp and displays duration.

**Independent Test**: Start a session, add an event, click the "Close [Tag]" button, verify the event shows calculated duration and the close button disappears.

### Implementation for User Story 1

- [x] T006 [US1] Add `closeEvent(eventId: string)` function to `src/composables/useEventStore.ts`
- [x] T007 [US1] Add `isOpen` computed property to EventCard for checking `endTimestamp` presence in `src/components/EventCard.vue`
- [x] T008 [US1] Add "Close [Tag]" button (visible only when `isOpen`) to template in `src/components/EventCard.vue`
- [x] T009 [US1] Add `close-event` emit handler and wire button click in `src/components/EventCard.vue`
- [x] T010 [US1] Handle `close-event` emit in parent component (EventList) to call `closeEvent()` in `src/components/EventList.vue`

**Checkpoint**: User Story 1 complete - users can manually close events with a button click

---

## Phase 4: User Story 2 - Automatic Event Closure on New Event (Priority: P2)

**Goal**: When a new event is created, any existing open event in the session is automatically closed with the new event's timestamp as its end time.

**Independent Test**: Start a session, add an event (shows "Ongoing"), add another event, verify the first event is now closed with calculated duration.

### Implementation for User Story 2

- [x] T011 [US2] Modify `createEvent()` to query for open events in session in `src/composables/useEventStore.ts`
- [x] T012 [US2] Add auto-close logic to set `endTimestamp` on open events before creating new event in `src/composables/useEventStore.ts`

**Checkpoint**: User Story 2 complete - previous events auto-close when new event is created

---

## Phase 5: User Story 3 - View Event Duration (Priority: P3)

**Goal**: Display duration for closed events in human-readable format, show "Ongoing" badge for open events, and include duration in markdown export.

**Independent Test**: View events list with mix of open/closed events, verify durations display correctly (e.g., "45 min", "1h 20min"), open events show "Ongoing" badge, legacy events show "—".

### Implementation for User Story 3

- [x] T013 [US3] Add `durationDisplay` computed property using `formatDuration()` in `src/components/EventCard.vue`
- [x] T014 [US3] Add duration display element (shows formatted duration or "—" for legacy) in `src/components/EventCard.vue`
- [x] T015 [US3] Add "Ongoing" badge element (shows when `isOpen` is true) in `src/components/EventCard.vue`
- [x] T016 [US3] Update `formatEventsAsMarkdownTable()` to add Duration column header in `src/utils/markdown.ts`
- [x] T017 [US3] Update `formatEventsAsMarkdownTable()` to include duration value per row in `src/utils/markdown.ts`

**Checkpoint**: User Story 3 complete - all duration display and export features working

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T018 Verify backward compatibility with existing events (no `endTimestamp`) display "—"
- [x] T019 Test duration formatting edge cases: < 1 min, exact hours, multi-hour durations
- [x] T020 Run `npm run build` to verify TypeScript compilation passes
- [x] T021 Run quickstart.md validation checklist manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A - existing project
- **Foundational (Phase 2)**: No dependencies - can start immediately, BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
  - US2 builds on US1's closeEvent mechanism
  - US3 builds on US1/US2's duration data
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses same Event model, integrates with closeEvent pattern from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on duration data from US1/US2 to display

### Within Each User Story

- Models/utilities before composables
- Composables before components
- Core implementation before UI wiring

### Parallel Opportunities

**Phase 2 (Foundational)** - All 5 tasks can run in parallel:
```
T001: Event.ts (model)
T002: db.ts (database)
T003: duration.ts (utility)
T004: en.json (i18n)
T005: fr.json (i18n)
```

**Phase 3 (US1)** - Sequential within story (same files)

**Phase 4 (US2)** - Sequential within story (same file as US1)

**Phase 5 (US3)** - Partial parallel:
```
# Can run in parallel (different files):
T016 + T017: markdown.ts
T013 + T014 + T015: EventCard.vue (sequential - same file)
```

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together:
Task: "Add endTimestamp field to Event interface in src/models/Event.ts"
Task: "Add Dexie v3 schema migration in src/services/db.ts"
Task: "Create duration formatting utility in src/utils/duration.ts"
Task: "Add i18n keys in src/locales/en.json"
Task: "Add i18n keys in src/locales/fr.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (5 tasks)
2. Complete Phase 3: User Story 1 (5 tasks)
3. **STOP and VALIDATE**: Test manual event closing works
4. Delivers: Users can click "Close [Tag]" to end events

### Incremental Delivery

1. Complete Foundational → Ready for features
2. Add User Story 1 → Manual close works → **MVP!**
3. Add User Story 2 → Auto-close works → Enhanced workflow
4. Add User Story 3 → Duration display works → Full feature
5. Polish → Production ready

### Single Developer Strategy

Execute phases sequentially:
1. Phase 2: Foundational (parallel tasks: ~5 tasks)
2. Phase 3: US1 (sequential: 5 tasks)
3. Phase 4: US2 (sequential: 2 tasks)
4. Phase 5: US3 (mostly sequential: 5 tasks)
5. Phase 6: Polish (4 tasks)

**Total: 21 tasks**

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No tests included (not requested in spec)
