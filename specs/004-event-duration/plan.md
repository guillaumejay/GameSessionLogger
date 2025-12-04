# Implementation Plan: Event Duration Tracking

**Branch**: `004-event-duration` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-event-duration/spec.md`

## Summary

Add event duration tracking to the game session logger. Users can close events via a "Close [Tag]" button, and adding a new event auto-closes the previous one. Each event stores an end timestamp, and duration is displayed in human-readable format. The markdown export includes duration for closed events.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: Vue 3.5.24, Dexie.js 4.2.1, Tailwind CSS 4.1.17, vue-i18n 11.x
**Storage**: IndexedDB via Dexie.js (schema upgrade to v3 required)
**Testing**: None specified (tests optional per constitution)
**Target Platform**: Web (browser), offline-capable PWA
**Project Type**: Single frontend application (Vue SPA)
**Performance Goals**: User interactions < 100ms, handle 100+ events per session
**Constraints**: Offline-first, no backend, all data in IndexedDB/localStorage
**Scale/Scope**: Single user, local storage, ~100 events per session typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Offline-First Architecture | ✅ PASS | All changes are client-side, IndexedDB storage |
| II. Component-Based UI | ✅ PASS | Updates to existing EventCard component, uses Vue Composition API |
| III. Type Safety (NON-NEGOTIABLE) | ✅ PASS | Event interface extended with typed fields, strict mode |
| IV. User-Centric Design | ✅ PASS | Single-click close, auto-close on new event, immediate feedback |
| V. Data Integrity | ✅ PASS | Dexie migration preserves existing data, backward compatible |

**Technical Standards Compliance**:
- Framework: Vue 3 with Composition API ✅
- Language: TypeScript strict mode ✅
- Storage: IndexedDB for session/event data ✅
- Styling: Tailwind CSS utility classes ✅

## Project Structure

### Documentation (this feature)

```text
specs/004-event-duration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── models/
│   └── Event.ts         # UPDATE: Add endTimestamp field to Event interface
├── services/
│   └── db.ts            # UPDATE: Add Dexie v3 migration for endTimestamp
├── composables/
│   └── useEventStore.ts # UPDATE: Add closeEvent function, modify createEvent
├── components/
│   └── EventCard.vue    # UPDATE: Add close button, duration display
├── utils/
│   ├── markdown.ts      # UPDATE: Include duration in export table
│   └── duration.ts      # NEW: Duration formatting utilities
└── locales/
    ├── en.json          # UPDATE: Add close/duration i18n keys
    └── fr.json          # UPDATE: Add close/duration i18n keys
```

**Structure Decision**: Single frontend application. No backend or API contracts needed - this is a pure client-side feature with IndexedDB storage.

## Complexity Tracking

> No violations - feature follows existing patterns with minimal additions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
