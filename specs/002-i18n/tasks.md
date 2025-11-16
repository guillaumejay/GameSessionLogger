# Tasks: Internationalization (i18n)

**Input**: Design documents from `/specs/002-i18n/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are OPTIONAL for this feature - not included per constitution (tests optional unless explicitly required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Using single project structure (Vue 3 SPA):
- **Source**: `src/` at repository root
- **Locales**: `src/locales/`
- **Types**: `src/types/`
- **Services**: `src/services/`
- **Composables**: `src/composables/`
- **Components**: `src/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure build system for i18n

- [x] T001 Install vue-i18n@10 dependency via npm
- [x] T002 Install @intlify/unplugin-vue-i18n as dev dependency via npm
- [x] T003 Configure Vite with VueI18nPlugin in vite.config.ts (add plugin, set feature flags)
- [x] T004 [P] Create directory structure: src/locales/, src/types/, src/composables/useI18n.ts
- [x] T005 [P] Copy type definitions from specs/002-i18n/contracts/i18n-types.ts to src/types/i18n.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create i18n instance in src/services/i18n.ts (setup createI18n with locale 'en', datetimeFormats, numberFormats, pluralizationRules)
- [x] T007 [P] Create UserSettings service in src/services/i18n.ts (I18nSettingsService class with getSettings, saveSettings, updateLanguagePreference, detectBrowserLanguage, getOrCreateSettings)
- [x] T008 Register i18n plugin in src/main.ts (app.use(i18n))
- [x] T009 [P] Create base English locale file src/locales/en.json (empty structure with app, nav, session, event, validation, settings sections)
- [x] T010 [P] Create base French locale file src/locales/fr.json (empty structure matching en.json)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Language Selection (Priority: P1) 🎯 MVP

**Goal**: Users can select their preferred language (English or French) and have the interface update immediately with persistence across sessions

**Independent Test**: Navigate to settings, switch language from English to French, verify UI updates immediately, refresh browser, verify language persists as French

### Implementation for User Story 1

- [x] T011 [P] [US1] Create useI18n composable in src/composables/useI18n.ts (export useI18n() returning { locale, t, d, n, setLocale, availableLocales })
- [x] T012 [P] [US1] Create LanguageSwitcher component in src/components/LanguageSwitcher.vue (dropdown mode with language options, emit change event, handle setLocale)
- [x] T013 [US1] Initialize locale on app startup in src/main.ts (call i18nSettingsService.getOrCreateSettings(), set i18n.global.locale)
- [x] T014 [US1] Add basic translations to src/locales/en.json (app.title, app.description, settings.language, settings.title)
- [x] T015 [US1] Add basic French translations to src/locales/fr.json (machine translate + review app.title, app.description, settings.language, settings.title)
- [x] T016 [US1] Add LanguageSwitcher to App.vue or settings area (import component, add to template in settings section)
- [x] T017 [US1] Verify browser language detection works (test with navigator.language = 'fr', verify French loads, test with 'de', verify English fallback)
- [x] T018 [US1] Verify localStorage persistence (switch to French, close tab, reopen, verify French persists)

**Checkpoint**: At this point, User Story 1 should be fully functional - language switcher works, preferences persist, browser detection works

---

## Phase 4: User Story 2 - Session and Event Logging in Selected Language (Priority: P2)

**Goal**: All session logging interface elements, labels, buttons, and messages appear in the user's selected language

**Independent Test**: Switch to French, create a new game session, log events, view session history - verify all labels, placeholders, buttons, column headers are in French

### Implementation for User Story 2

- [x] T019 [P] [US2] Extract all session-related strings from existing components to src/locales/en.json (session.start, session.end, session.duration, session.name, session.game, etc.)
- [x] T020 [P] [US2] Extract all event-related strings from existing components to src/locales/en.json (event.add, event.type, event.description, event.count with pluralization, etc.)
- [x] T021 [P] [US2] Machine translate all session strings to French in src/locales/fr.json
- [x] T022 [P] [US2] Machine translate all event strings to French in src/locales/fr.json
- [x] T023 [US2] Human review French translations for session/event terms (review gaming terminology, ensure natural phrasing)
- [x] T024 [US2] Update SessionSelector component to use $t() for all text (replace hard-coded strings with {{ $t('session.xxx') }})
- [x] T025 [US2] Update EventLogger component to use $t() for all text (replace hard-coded strings with {{ $t('event.xxx') }})
- [x] T026 [US2] Update EventList component to use $t() for all text (replace hard-coded strings with {{ $t('event.xxx') }})
- [x] T027 [US2] Update EventCard component to use $t() for all text (replace hard-coded strings with {{ $t('event.xxx') }})
- [x] T028 [US2] Add pluralization for event count in src/locales/en.json (e.g., "No events | One event | {count} events")
- [x] T029 [US2] Add French pluralization for event count in src/locales/fr.json (e.g., "Aucun événement | {count} événements")
- [x] T030 [US2] Test date/time formatting in French (verify DD/MM/YYYY format, 24h time in session timestamps)
- [x] T031 [US2] Test complete session workflow in French (create session, log events, view history, verify all text is French)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can switch language and use full session logging in French

---

## Phase 5: User Story 3 - Error Messages and Notifications in Selected Language (Priority: P3)

**Goal**: All system feedback, error messages, validation messages, and notifications appear in the user's selected language

**Independent Test**: Switch to French, trigger validation errors (e.g., submit empty form), trigger success notifications (e.g., save session), trigger system errors - verify all messages appear in French

### Implementation for User Story 3

- [x] T032 [P] [US3] Extract all validation messages to src/locales/en.json (validation.required, validation.invalid, validation.tooLong, etc.)
- [x] T033 [P] [US3] Extract all success messages to src/locales/en.json (success.saved, success.deleted, success.exported, etc.)
- [x] T034 [P] [US3] Extract all error messages to src/locales/en.json (error.loadFailed, error.saveFailed, error.notFound, etc.)
- [x] T035 [P] [US3] Machine translate all validation messages to French in src/locales/fr.json
- [x] T036 [P] [US3] Machine translate all success messages to French in src/locales/fr.json
- [x] T037 [P] [US3] Machine translate all error messages to French in src/locales/fr.json
- [x] T038 [US3] Human review French translations for error/validation messages (ensure clarity and professionalism)
- [x] T039 [US3] Update useToast composable in src/composables/useToast.ts to use $t() for messages (pass translation keys instead of hard-coded strings)
- [x] T040 [US3] Update all Swal.fire() calls to use $t() for error messages (search codebase for sweetalert2 usage, replace text with translation keys)
- [x] T041 [US3] Add form validation messages using $t() where validation occurs (update validation logic to reference translation keys)
- [x] T042 [US3] Test validation errors in French (submit invalid forms, verify French error messages)
- [x] T043 [US3] Test success notifications in French (save session, export markdown, verify French success messages)
- [x] T044 [US3] Test error handling in French (simulate IndexedDB errors, verify French error messages)

**Checkpoint**: All user stories should now be independently functional - complete i18n experience in English and French

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalization

- [x] T045 [P] Verify 95%+ translation coverage (audit all components for hard-coded strings, extract any remaining text)
- [x] T046 [P] Add named placeholders to translations (e.g., session.welcome: "Welcome, {username}!" and update usage)
- [x] T047 [P] Verify fallback behavior for missing translations (test with invalid key, verify English fallback and console warning)
- [x] T048 [P] Verify bundle size impact (run npm run build, verify vue-i18n adds <20KB gzipped)
- [x] T049 Test language switching performance (measure time from locale change to UI update, verify <100ms)
- [x] T050 Test browser language detection edge cases (test with 'en-US', 'fr-FR', 'fr-CA', 'de', verify correct defaults)
- [x] T051 Verify localStorage structure matches UserSettings schema (inspect localStorage, verify version:1 and language object structure)
- [x] T052 [P] Add accessibility labels to LanguageSwitcher (aria-label, lang attributes on language options)
- [x] T053 [P] Document translation process in README or docs (how to add new languages, how to update translations)
- [x] T054 Run full application manual test in both languages (complete user journey in English, repeat in French, verify consistency)
- [x] T055 Verify constitution compliance (offline-first: no network calls, type safety: no any usage, component-based: LanguageSwitcher is reusable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but builds on translation infrastructure
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 but builds on translation infrastructure

### Within Each User Story

- Tasks marked [P] can run in parallel within the same story
- Translation extraction before translation to French
- Machine translation before human review
- Component updates can run in parallel [P]
- Complete story before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T004, T005)
- All Foundational tasks marked [P] can run in parallel (T007, T009, T010)
- Once Foundational phase completes, all three user stories can start in parallel (if team capacity allows)
- Within each story, tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all translation extraction tasks together:
Task T019: "Extract all session-related strings to en.json"
Task T020: "Extract all event-related strings to en.json"

# Launch all machine translation tasks together:
Task T021: "Machine translate session strings to French"
Task T022: "Machine translate event strings to French"

# Launch all component updates together:
Task T024: "Update SessionSelector to use $t()"
Task T025: "Update EventLogger to use $t()"
Task T026: "Update EventList to use $t()"
Task T027: "Update EventCard to use $t()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005) - ~30 minutes
2. Complete Phase 2: Foundational (T006-T010) - ~1 hour
3. Complete Phase 3: User Story 1 (T011-T018) - ~2 hours
4. **STOP and VALIDATE**: Test language switcher independently
   - Switch from English to French
   - Verify UI updates immediately
   - Close and reopen browser
   - Verify French persists
5. Deploy/demo if ready - **MVP DELIVERED**

**Total MVP Time**: ~3.5 hours

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + i18n infrastructure → ~1.5 hours
2. **MVP** (Phase 3): User Story 1 → Test independently → Deploy/Demo → ~2 hours
3. **V2** (Phase 4): User Story 2 → Test independently → Deploy/Demo → ~4 hours
4. **V3** (Phase 5): User Story 3 → Test independently → Deploy/Demo → ~3 hours
5. **Polish** (Phase 6): Cross-cutting improvements → ~2 hours

**Total Feature Time**: ~12.5 hours

### Parallel Team Strategy

With 2-3 developers:

1. **Together**: Complete Setup + Foundational (Phases 1-2) → ~1.5 hours
2. **Once Foundational is done**:
   - Developer A: User Story 1 (T011-T018)
   - Developer B: User Story 2 (T019-T031) - starts English extraction
   - Developer C: User Story 3 (T032-T044) - starts English extraction
3. Stories complete and integrate independently
4. **Together**: Polish phase (Phase 6)

**Parallel Total Time**: ~6 hours (with 3 developers)

---

## Translation Workflow Guide

### Adding New Translations

1. **Extract English strings**:
   - Identify hard-coded text in components
   - Choose hierarchical key (e.g., `session.start`)
   - Add to `src/locales/en.json`

2. **Machine translate to French**:
   - Use Google Translate or DeepL
   - Paste into `src/locales/fr.json`
   - Keep same key structure

3. **Human review** (REQUIRED):
   - Review with native French speaker
   - Verify gaming terminology
   - Check context and natural phrasing
   - Test in application

4. **Update component**:
   - Replace hard-coded string with `{{ $t('key') }}`
   - For script: `const { t } = useI18n(); t('key')`
   - For placeholders: `$t('key', { username: 'Alice' })`

### Pluralization Format

**English** (en.json):
```json
{
  "event.count": "No events | One event | {count} events"
}
```

**French** (fr.json):
```json
{
  "event.count": "Aucun événement | {count} événements"
}
```

**Usage**:
```vue
{{ $t('event.count', eventCount, { count: eventCount }) }}
```

---

## Testing Checklist

Manual testing per user story (no automated tests per constitution):

### User Story 1: Language Selection
- [ ] Switch from English to French in settings - UI updates immediately
- [ ] Switch from French to English - UI updates immediately
- [ ] Close browser, reopen - language preference persists
- [ ] Test with browser set to French - app loads in French
- [ ] Test with browser set to German - app loads in English (fallback)

### User Story 2: Session Logging
- [ ] In French: Create new session - all labels in French
- [ ] In French: Log events - all inputs/buttons in French
- [ ] In French: View session history - all columns in French
- [ ] In French: Dates display as DD/MM/YYYY
- [ ] In English: All same workflows display in English
- [ ] Event count pluralization works (0, 1, 2+ events)

### User Story 3: Error Messages
- [ ] In French: Submit empty form - validation errors in French
- [ ] In French: Save session - success notification in French
- [ ] In French: Trigger error - error message in French
- [ ] In English: All same scenarios display in English

### Cross-Cutting
- [ ] All UI text is translatable (no hard-coded strings remain)
- [ ] Missing translation keys fall back to English with console warning
- [ ] Language switch mid-session preserves all data
- [ ] Bundle size increase <20 KB
- [ ] Language switch completes <100ms
- [ ] No TypeScript errors, no `any` usage
- [ ] Works offline (no network calls for i18n)

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story (US1, US2, US3)
- Each user story should be independently completable and testable
- All translations require human review before considering complete
- Commit after completing each user story phase
- Stop at any checkpoint to validate story independently
- Prioritize US1 for MVP - delivers immediate value (language switching)
- US2 and US3 can be delayed if needed (incremental delivery)
- Translation coverage target: 95%+ (audit thoroughly in polish phase)
