# Implementation Plan: Game Session Event Logging

**Branch**: `001-event-logging` | **Date**: 2025-11-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-event-logging/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a responsive web application for logging game session events with named session management, predefined event tags (Combat, Roleplay, Downtime, Scoring, Meal, Other), optional descriptions via inline text field, and markdown table export to clipboard. All data persists locally in the browser (offline-first). Events display in reverse chronological order within each session. Individual event deletion uses inline confirmation prompts. Technical approach: Vue 3 Composition API with TypeScript strict mode, Tailwind CSS for styling, IndexedDB for session/event persistence, and Clipboard API for export.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) / ECMAScript 2022+
**Primary Dependencies**: Vue 3 (latest), Vite 6.x (latest), Tailwind CSS 4.x (latest), IndexedDB (via Dexie.js 4.x)
**Storage**: IndexedDB for session and event data, localStorage for user preferences
**Testing**: Vitest for unit/component tests (optional per spec), Playwright for E2E tests (optional per spec)
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) - desktop, tablet, mobile
**Project Type**: Single-page web application (SPA)
**Performance Goals**: Event logging <3s, event display <100ms, clipboard copy <1s for 100 events, page load <2s on 3G
**Constraints**: Offline-capable, no backend/API dependencies, bundle size <500KB gzipped, responsive (mobile/tablet/desktop)
**Scale/Scope**: Single-user local application, support 100+ events per session, multiple named sessions, <10 components initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Offline-First Architecture ✅
- **Requirement**: Application must function entirely without server/network
- **Compliance**: IndexedDB for all session/event data, no external API dependencies
- **Status**: PASS

### II. Component-Based UI ✅
- **Requirement**: Vue 3 Composition API, reusable components, single responsibilities
- **Compliance**: Planned component architecture (SessionSelector, EventLogger, EventList, EventCard, MarkdownExporter)
- **Status**: PASS

### III. Type Safety (NON-NEGOTIABLE) ✅
- **Requirement**: TypeScript strict mode, no `any` types, all props/events typed
- **Compliance**: TypeScript 5.x strict mode, all entities and interfaces fully typed
- **Status**: PASS

### IV. User-Centric Design ✅
- **Requirement**: Responsive (mobile/tablet/desktop), intuitive UX, immediate visual feedback
- **Compliance**: Tailwind CSS responsive utilities, inline text field for speed, visual feedback on all actions
- **Status**: PASS

### V. Data Integrity ✅
- **Requirement**: Never lose data, immediate persistence, handle storage limits gracefully
- **Compliance**: IndexedDB with automatic persistence on every event, markdown export for backup
- **Status**: PASS

**GATE RESULT**: ALL CHECKS PASSED ✅ - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
│   ├── SessionSelector.vue      # Create/select/switch sessions
│   ├── EventLogger.vue           # Event tag buttons + inline description field
│   ├── EventList.vue             # Display events in reverse chronological order
│   ├── EventCard.vue             # Individual event item with inline delete confirmation
│   └── MarkdownExporter.vue      # Copy to clipboard as markdown table
├── composables/
│   ├── useSessionStore.ts        # Session CRUD operations with IndexedDB
│   ├── useEventStore.ts          # Event CRUD operations with IndexedDB
│   └── useClipboard.ts           # Clipboard API wrapper with error handling
├── models/
│   ├── Session.ts                # Session entity type definition
│   └── Event.ts                  # Event entity type definition
├── services/
│   └── db.ts                     # IndexedDB initialization (Dexie.js schema)
├── utils/
│   └── markdown.ts               # Markdown table formatter with character escaping
├── App.vue                       # Root component
└── main.ts                       # Application entry point

tests/ (optional per spec)
├── unit/
│   ├── composables/
│   └── utils/
└── e2e/
    └── session-logging.spec.ts

public/
└── favicon.ico

index.html
package.json
tsconfig.json
vite.config.ts
tailwind.config.js
```

**Structure Decision**: Single-page application structure. All source code in `src/` following Vue 3 best practices with Composition API. Components are feature-focused (session management, event logging, display, export). Composables encapsulate reactive state and business logic. Models define TypeScript interfaces for type safety. Services handle infrastructure (database). Utils for pure functions (markdown formatting).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No complexity violations. All constitution principles are satisfied by the planned architecture.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion*

### I. Offline-First Architecture ✅
- **Design Validation**: Dexie.js for IndexedDB (sessions + events), localStorage for active session ID
- **No Network Dependencies**: All operations client-side, no API calls
- **Status**: PASS

### II. Component-Based UI ✅
- **Component Count**: 5 components (SessionSelector, EventLogger, EventList, EventCard, MarkdownExporter)
- **Composables**: 3 composables (useSessionStore, useEventStore, useClipboard) following Composition API
- **Single Responsibility**: Each component has clear, focused purpose
- **Status**: PASS

### III. Type Safety (NON-NEGOTIABLE) ✅
- **Strict Mode**: TypeScript 5.x with `strict: true` in tsconfig.json
- **Type Coverage**: Session and Event interfaces in `/models`, all composables fully typed
- **No `any` Types**: None used in design
- **Status**: PASS

### IV. User-Centric Design ✅
- **Responsive**: Tailwind CSS with mobile-first breakpoints (sm, md, lg)
- **Immediate Feedback**: Visual feedback on all actions (event creation, clipboard copy, deletion)
- **Intuitive UX**: Inline description field (always visible), inline delete confirmation (no disruptive modals)
- **Status**: PASS

### V. Data Integrity ✅
- **Immediate Persistence**: IndexedDB write on every event/session creation/deletion
- **No Data Loss**: Cascade delete pattern (session → events), UUID primary keys prevent collisions
- **Storage Limit Handling**: Quota monitoring planned (navigator.storage.estimate())
- **Backup**: Markdown export provides external backup mechanism
- **Status**: PASS

**FINAL GATE RESULT**: ALL CHECKS PASSED ✅ - Ready for implementation (Phase 2: /speckit.tasks)
