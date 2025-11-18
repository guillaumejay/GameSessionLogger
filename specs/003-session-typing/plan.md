# Implementation Plan: Session Type Classification

**Branch**: `003-session-typing` | **Date**: 2025-11-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-session-typing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add session type classification (RPG or Boardgame) to the existing GameSessionLogger application. Users select a mandatory session type during session creation, which determines the available event tags (RPG: Combat, Roleplay, Downtime, Scoring, Meal, Other; Boardgame: Setup, Turn, Round, Scoring, Teardown, Other). Session types are displayed as icons with hover tooltips in the session list. All type labels are internationalized using the existing i18n system from feature 002. Existing sessions are automatically migrated to "RPG" type. Technical approach: Extend existing Session model with `type` attribute, update IndexedDB schema (v2), modify SessionSelector and EventLogger components, add type-to-tags mapping, implement migration logic, and integrate with vue-i18n for localized labels.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode) / ECMAScript 2022+
**Primary Dependencies**: Vue 3.5.24, Vite 7.2.2, Tailwind CSS 4.1.17, Dexie.js 4.2.1, vue-i18n 10.x
**Storage**: IndexedDB for session and event data (schema upgrade to v2 required), localStorage for user preferences (language)
**Testing**: Vitest for unit/component tests (optional per spec), Playwright for E2E tests (optional per spec)
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) - desktop, tablet, mobile
**Project Type**: Single-page web application (SPA) - extends existing application
**Performance Goals**: Type selection adds <50ms to session creation, tag list switch <1s, migration completes on first load
**Constraints**: Offline-capable, no backend dependencies, maintain backward compatibility with existing sessions, bundle size increase <20KB gzipped
**Scale/Scope**: 2 session types (RPG, Boardgame), 6 tags per type, modify 2 core components (SessionSelector, EventLogger), add 1 utility function, update 1 model, 1 database migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Offline-First Architecture ✅
- **Requirement**: Application must function entirely without server/network
- **Compliance**: All session type data stored in IndexedDB, no external API dependencies
- **Status**: PASS

### II. Component-Based UI ✅
- **Requirement**: Vue 3 Composition API, reusable components, single responsibilities
- **Compliance**: Modifies existing components (SessionSelector, EventLogger) without violating single responsibility, adds type-specific tag mapping
- **Status**: PASS

### III. Type Safety (NON-NEGOTIABLE) ✅
- **Requirement**: TypeScript strict mode, no `any` types, all props/events typed
- **Compliance**: Session type defined as union type `'RPG' | 'Boardgame'`, all new props and emits fully typed
- **Status**: PASS

### IV. User-Centric Design ✅
- **Requirement**: Responsive (mobile/tablet/desktop), intuitive UX, immediate visual feedback
- **Compliance**: Type selection integrated into existing session creation form, icons with tooltips for accessibility, responsive design maintained
- **Status**: PASS

### V. Data Integrity ✅
- **Requirement**: Never lose data, immediate persistence, handle storage limits gracefully
- **Compliance**: Database migration automatically assigns "RPG" to existing sessions, invalid types fallback to "RPG", no data loss
- **Status**: PASS

**GATE RESULT**: ALL CHECKS PASSED ✅ - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-session-typing/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SessionSelector.vue      # MODIFIED: Add type selection to create session form
│   ├── EventLogger.vue           # MODIFIED: Display type-specific event tags
│   ├── EventList.vue             # NO CHANGE
│   ├── EventCard.vue             # NO CHANGE
│   └── MarkdownExporter.vue      # NO CHANGE
│   └── LanguageSwitcher.vue      # NO CHANGE
├── composables/
│   ├── useSessionStore.ts        # MODIFIED: Include type in session creation/retrieval
│   ├── useEventStore.ts          # NO CHANGE
│   ├── useClipboard.ts           # NO CHANGE
│   ├── useI18n.ts                # NO CHANGE
│   └── useToast.ts               # NO CHANGE
├── models/
│   ├── Session.ts                # MODIFIED: Add type attribute and validation
│   ├── Event.ts                  # MODIFIED: Add type-specific tag lists
│   └── SessionType.ts            # NEW: Session type definitions and utilities
├── services/
│   ├── db.ts                     # MODIFIED: Upgrade schema to v2, add migration
│   └── i18n.ts                   # MODIFIED: Add session type translation keys
├── utils/
│   ├── markdown.ts               # NO CHANGE
│   └── sessionTypeTags.ts        # NEW: Mapping from session type to tag list
├── types/
│   └── i18n.ts                   # NO CHANGE
├── locales/
│   ├── en.json                   # MODIFIED: Add session type labels
│   └── fr.json                   # MODIFIED: Add session type labels
├── App.vue                       # NO CHANGE
└── main.ts                       # NO CHANGE

tests/ (optional per spec)
├── unit/
│   ├── models/
│   │   └── SessionType.spec.ts   # NEW: Test type validation and tag mapping
│   └── utils/
│       └── sessionTypeTags.spec.ts # NEW: Test tag retrieval
└── e2e/
    └── session-typing.spec.ts    # NEW: Test type selection and display

public/                           # NO CHANGE
```

**Structure Decision**: Extends existing single-page web application structure. No new directories required. Modifications are isolated to models, components, and services layers. New files added for session type logic (`SessionType.ts`, `sessionTypeTags.ts`) to maintain separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - table not needed.
