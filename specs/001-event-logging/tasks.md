# Tasks: Game Session Event Logging

**Input**: Design documents from `/specs/001-event-logging/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per spec - no test tasks included unless explicitly requested

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single-page app**: `src/` at repository root
- Components in `src/components/`
- Composables in `src/composables/`
- Models in `src/models/`
- Services in `src/services/`
- Utils in `src/utils/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vue 3 + TypeScript + Vite project using `npm create vite@latest game-session-logger -- --template vue-ts`
- [x] T002 Install core dependencies: dexie@^4.0.0, tailwindcss@latest, @tailwindcss/vite@latest
- [x] T003 Configure Tailwind CSS Vite plugin in vite.config.ts per quickstart.md
- [x] T004 Configure TypeScript strict mode in tsconfig.json with strict: true, noImplicitAny: true
- [x] T005 Create project directory structure (src/components, src/composables, src/models, src/services, src/utils)
- [x] T006 Update src/style.css with `@import "tailwindcss";` for Tailwind 4.x

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create Session TypeScript interface in src/models/Session.ts with validateSessionName function (1-100 char validation)
- [x] T008 [P] Create Event TypeScript interface in src/models/Event.ts with EventTag type, EVENT_TAGS constant, isValidEventTag, and validateEventDescription functions (500 char limit)
- [x] T009 Initialize Dexie database schema in src/services/db.ts with GameSessionDatabase class, sessions table (id, createdAt indexes), and events table (id, [sessionId+timestamp] composite index)
- [x] T010 [P] Implement useSessionStore composable in src/composables/useSessionStore.ts with createSession, deleteSession, setActiveSession, loadSessions functions and reactive state (sessions, activeSession, isLoading, error)
- [x] T011 [P] Implement useEventStore composable in src/composables/useEventStore.ts with createEvent, deleteEvent, deleteAllEvents, loadEvents functions and reactive state (events, isLoading, error)
- [x] T012 Verify IndexedDB database creation in browser DevTools Application tab (GameSessionLoggerDB with sessions and events tables)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Event Logging (Priority: P1) 🎯 MVP

**Goal**: Enable users to create sessions, log events with tags and optional descriptions, and view them in reverse chronological order

**Independent Test**: Create a new named session, click event tags (Combat, Roleplay, Downtime, Scoring, Meal), optionally type in the always-visible description field below tags, and verify events appear in the list with correct timestamps in HH:MM format within that session

### Implementation for User Story 1

- [x] T013 [P] [US1] Create SessionSelector.vue component with session creation form (input maxlength=100, create button) and session list with active state highlighting
- [x] T014 [P] [US1] Create EventLogger.vue component with 6 event tag buttons (Combat, Roleplay, Downtime, Scoring, Meal, Other) and always-visible inline description textarea (maxlength=500)
- [x] T015 [P] [US1] Create EventCard.vue component to display single event with tag badge, timestamp formatted as HH:MM using Intl.DateTimeFormat (locale-aware), and description text
- [x] T016 [US1] Create EventList.vue component to display events array in reverse chronological order using v-for with EventCard, include empty state message
- [x] T017 [US1] Integrate SessionSelector into App.vue with useSessionStore, call loadSessions in onMounted lifecycle hook
- [x] T018 [US1] Integrate EventLogger and EventList into App.vue conditionally rendered when activeSession exists, pass sessionId prop
- [x] T019 [US1] Add visual feedback for event creation success in EventLogger (toast notification, loading spinner during createEvent call)
- [x] T020 [US1] Implement responsive layout with Tailwind CSS mobile-first approach (single column mobile, two-column md:grid-cols-3 tablet/desktop)
- [x] T021 [US1] Test session creation, event logging with tags and descriptions, and event display in browser manually per acceptance scenarios in spec.md
- [x] T022 [US1] Verify events and active session persist across browser refreshes by checking IndexedDB and localStorage activeSessionId

**Checkpoint**: At this point, User Story 1 (MVP) should be fully functional - users can create sessions, log events, and view them

---

## Phase 4: User Story 2 - Event List Management (Priority: P2)

**Goal**: Enable users to delete individual events with inline confirmation to prevent accidental deletion

**Independent Test**: Log several events in a session, click delete on specific events, confirm via inline prompt, and verify the correct events are removed while others remain in the list

### Implementation for User Story 2

- [x] T023 [US2] Add inline confirmation UI to EventCard.vue with showInlineConfirmation prop, confirm/cancel buttons rendered conditionally
- [x] T024 [US2] Implement delete event handler in EventCard.vue that emits delete-requested, delete-confirmed, delete-cancelled events per contracts/composables-api.md
- [x] T025 [US2] Wire delete-confirmed event from EventCard to EventList parent component and call useEventStore.deleteEvent with eventId
- [x] T026 [US2] Add empty state message to EventList.vue displayed when events.length === 0 ("No events logged yet")
- [x] T027 [US2] Test individual event deletion with inline confirmation flow (click delete → confirm → verify removed, cancel → verify retained)
- [x] T028 [US2] Verify deletion completes within 500ms using browser DevTools Performance tab per success criteria SC-008

**Checkpoint**: At this point, User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Copy Events to Clipboard (Priority: P3)

**Goal**: Enable users to copy all events from current session to clipboard as markdown table

**Independent Test**: Log multiple events with different tags and descriptions in a session, click "Copy to Clipboard" button, and verify clipboard contains properly formatted markdown table with Time, Event Type, and Description columns

### Implementation for User Story 3

- [x] T029 [P] [US3] Create markdown.ts utility in src/utils/markdown.ts with formatEventsAsMarkdownTable function returning markdown table string with pipe-separated columns
- [x] T030 [P] [US3] Implement escapeMarkdownCharacters function in src/utils/markdown.ts to escape pipe (|), backslash (\), and newlines in event descriptions per FR-022
- [x] T031 [P] [US3] Create useClipboard composable in src/composables/useClipboard.ts with copyToClipboard function wrapping navigator.clipboard.writeText, error handling for unsupported browsers and permission denied
- [x] T032 [US3] Create MarkdownExporter.vue component with "Copy to Clipboard" button, receive sessionId prop per contracts/composables-api.md
- [x] T033 [US3] Implement clipboard copy logic in MarkdownExporter: fetch events from useEventStore, call formatEventsAsMarkdownTable, call useClipboard.copyToClipboard
- [x] T034 [US3] Add visual feedback for successful copy (toast "Copied to clipboard!") and error handling with user-friendly message ("Clipboard access denied. Please check browser permissions.")
- [x] T035 [US3] Handle empty event list case in MarkdownExporter - disable button or show message "No events to copy" when events.length === 0
- [x] T036 [US3] Integrate MarkdownExporter into App.vue below EventLogger component, pass activeSession.id as sessionId prop
- [x] T037 [US3] Test markdown table output by copying and pasting into Discord, Slack, GitHub, or Notion to verify correct rendering with proper column alignment
- [x] T038 [US3] Verify clipboard copy completes within 1 second for 100 events using browser DevTools Performance tab per success criteria SC-010

**Checkpoint**: All three user stories (US1, US2, US3) should now be independently functional

---

## Phase 6: User Story 4 - Bulk Event Deletion (Priority: P4)

**Goal**: Enable users to delete all events from current session at once with confirmation

**Independent Test**: Log multiple events in a session, click "delete all" action, confirm, and verify all events are removed from the current session

### Implementation for User Story 4

- [x] T039 [US4] Add "Delete All Events" button to EventList.vue footer, styled with destructive color scheme (red background)
- [x] T040 [US4] Implement inline confirmation UI for bulk deletion in EventList.vue (consistent with individual delete pattern - show confirm/cancel inline, not modal)
- [x] T041 [US4] Wire bulk delete confirm button to useEventStore.deleteAllEvents with activeSession.id parameter
- [x] T042 [US4] Show empty state in EventList after bulk deletion completes (events.length === 0 triggers empty message)
- [x] T043 [US4] Test bulk deletion with confirmation flow (click Delete All → inline confirm/cancel → verify all removed or retained)
- [x] T044 [US4] Verify deletion completes within 500ms for 100 events using browser DevTools Performance tab per success criteria SC-008

**Checkpoint**: All user stories (US1-US4) should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

### Edge Case Handling (addresses spec.md lines 88-95)

- [ ] T045 [P] Implement rapid click debouncing in EventLogger.vue to prevent duplicate events when user clicks tag buttons quickly (300ms debounce on createEvent calls)
- [ ] T046 [P] Add visual character counter to description textarea in EventLogger.vue showing "X/500 characters" and validation error message when exceeding 500 chars per FR-022 and data-model.md line 138
- [ ] T047 Test long description text (500+ characters) by entering 501 chars and verifying validation error prevents event creation per validateEventDescription function
- [ ] T048 [P] Implement storage quota monitoring in App.vue using navigator.storage.estimate() per plan.md line 152 and data-model.md lines 244-247
- [ ] T049 Add warning toast when storage exceeds 80% capacity with message "Storage limit approaching. Please delete old sessions or export data." per data-model.md line 246
- [ ] T050 Test midnight timestamp edge case: log event at 23:59, wait until 00:00, log another event, verify both display correct HH:MM format and chronological ordering

### Session Management Enhancements

- [ ] T051 Add session deletion feature to SessionSelector.vue with inline delete button per user story, cascade delete events via useSessionStore.deleteSession per data-model.md line 92
- [ ] T052 Implement session name uniqueness warning in SessionSelector.vue - check if name already exists in sessions array and show non-blocking warning message per data-model.md lines 65, 255-257

### Error Handling & User Feedback

- [ ] T053 [P] Implement toast notification system using Vue 3 Teleport or lightweight library (e.g., vue-toastification) for success/error messages across all components
- [ ] T054 [P] Add comprehensive error handling for IndexedDB quota exceeded errors in composables - catch and display user-friendly message per research.md lines 158-160
- [ ] T055 Test clipboard permission denied scenario by blocking clipboard access in browser settings and verifying error message "Clipboard access denied" appears per FR-021

### Performance Validation

- [ ] T056 [P] Optimize bundle size by running `npm run build` and verifying gzipped output <500KB per plan.md line 22 and constitution.md line 84
- [ ] T057 [P] Test responsive layouts on mobile (320px width), tablet (768px width), desktop (1024px+ width) using browser DevTools device emulation per research.md lines 128-131
- [ ] T058 Verify all performance goals from spec.md success criteria: event logging <3s (SC-003), event display <100ms (SC-004), clipboard copy <1s for 100 events (SC-010)
- [ ] T059 Test with 100+ events per session to verify no performance degradation (scrolling, rendering, filtering) per SC-005 and research.md lines 135-146

### Final Quality Checks

- [ ] T060 [P] Add keyboard shortcuts for power users: Ctrl+Enter in description field to log event, Escape to clear description per research.md line 132
- [ ] T061 Test all acceptance scenarios from spec.md lines 28-83 systematically (US1: 4 scenarios, US2: 3 scenarios, US3: 4 scenarios, US4: 3 scenarios)
- [ ] T062 [P] Code cleanup: remove console.logs except error logging, remove unused imports, verify no TypeScript `any` types used per constitution.md lines 42-46
- [ ] T063 Run production build with `npm run build` and verify zero TypeScript errors and zero ESLint warnings
- [ ] T064 Test data persistence: create session, log 10 events, close browser, reopen, verify all data intact and activeSession restored per FR-013 and SC-007

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends EventCard from US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses events from US1 but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Extends EventList from US1 but independently testable

### Within Each User Story

- **US1**: Models/services (T013-T015 parallel) → Integration (T016-T018) → Polish (T019-T022)
- **US2**: All tasks sequential (modify EventCard/EventList from US1)
- **US3**: Util + composable (T029-T031 parallel) → Component (T032-T034) → Integration (T036-T038)
- **US4**: All tasks sequential (modify EventList from US1)

### Parallel Opportunities

- **Setup phase**: T002-T003 can run in parallel
- **Foundational phase**: T007-T008 parallel, T010-T011 parallel
- **US1 phase**: T013-T015 parallel (different components)
- **US3 phase**: T029-T031 parallel (util and composable)
- **Polish phase**: T045-T046 parallel, T048-T049 parallel, T053-T054 parallel, T056-T057 parallel, T060-T062 parallel

---

## Parallel Example: User Story 1 (MVP)

```bash
# Launch component creation in parallel:
Task T013: "Create SessionSelector.vue component"
Task T014: "Create EventLogger.vue component"
Task T015: "Create EventCard.vue component"

# Then integrate sequentially:
Task T016: "Create EventList.vue component" (uses EventCard)
Task T017: "Integrate SessionSelector into App.vue"
Task T018: "Integrate EventLogger and EventList into App.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Tasks T001-T006)
2. Complete Phase 2: Foundational (Tasks T007-T012) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (Tasks T013-T022)
4. **STOP and VALIDATE**: Test User Story 1 independently per acceptance scenarios
5. Deploy/demo if ready

**MVP Deliverable**: Users can create sessions, log events with tags and descriptions, and view events in reverse chronological order. All data persists across refreshes.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add Polish (Phase 7) → Final validation → Deploy
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T022)
   - Developer B: User Story 3 (T029-T038) - can work in parallel since it uses composables from Foundational
3. Sequential after MVP:
   - Developer C: User Story 2 (T023-T028) - requires EventCard from US1
   - Developer D: User Story 4 (T039-T044) - requires EventList from US1
4. All developers: Polish (Phase 7, T045-T064)

---

## Notes

- [P] tasks = different files/components, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Session and Event models are used by all stories → placed in Foundational phase
- Tests are OPTIONAL per spec - omitted from task list unless explicitly requested

---

## Task Summary

- **Total Tasks**: 64 (up from 55 - added 9 tasks to address analysis gaps)
- **Setup Phase**: 6 tasks
- **Foundational Phase**: 6 tasks (BLOCKING)
- **User Story 1 (P1 - MVP)**: 10 tasks
- **User Story 2 (P2)**: 6 tasks
- **User Story 3 (P3)**: 10 tasks
- **User Story 4 (P4)**: 6 tasks
- **Polish Phase**: 20 tasks (expanded from 11 to address edge cases, storage quota, character limits)

**Parallel Opportunities**: 20 tasks can run in parallel (marked with [P])

**Critical Path**: Setup → Foundational → US1 (MVP) = 22 tasks

**Suggested MVP**: Complete through Phase 3 (User Story 1) = 22 tasks for working MVP

---

## Changes from Previous Version (Analysis-Driven Updates)

### CRITICAL Issues Resolved

1. **G4 - Storage Quota Monitoring**: Added T048-T049 to implement navigator.storage.estimate() and 80% warning per plan.md line 152
2. **A1 - Character Limit Enforcement**: Added T046-T047 to enforce 500 character limit with visual counter and validation per FR-022 and data-model.md line 138

### HIGH Priority Issues Resolved

3. **G2 - Edge Case Coverage**: Added T045 (rapid click debouncing), T047 (long text validation), T050 (midnight timestamp edge case) to address spec.md lines 88-95
4. **U1 - Bulk Delete UX Consistency**: Clarified T040 to use inline confirmation (not modal) consistent with individual delete pattern

### Additional Improvements

5. **Session Management**: Added T051 (session deletion with cascade), T052 (name uniqueness warning) to address data-model.md requirements
6. **Error Handling**: Added T053-T055 (toast system, quota errors, clipboard permissions) for comprehensive error coverage per research.md
7. **Performance Validation**: Expanded T056-T059 to systematically test all success criteria (SC-003 through SC-012)
8. **Final Quality**: Added T060-T064 (keyboard shortcuts, acceptance scenarios, code cleanup, production build, persistence testing)

All tasks now strictly follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
