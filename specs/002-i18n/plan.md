# Implementation Plan: Internationalization (i18n)

**Branch**: `002-i18n` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-i18n/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add internationalization support to enable users to switch between English and French languages throughout the application. The feature includes a language switcher in settings/preferences, persistent language preferences across sessions, automatic browser language detection, and localized formatting for dates, times, and numbers. Translations will support named placeholders and ICU Message Format for pluralization, with French translations provided via machine translation and human review.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode) / ECMAScript 2022+
**Primary Dependencies**: Vue 3.5.24, Vite 7.2.2, Tailwind CSS 4.1.17, vue-i18n 10.x, @intlify/unplugin-vue-i18n
**Storage**: localStorage for language preference, IndexedDB (Dexie.js 4.2.1) for session data
**Testing**: Vitest (not yet configured) for unit tests, Playwright (not yet configured) for E2E tests
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - ES2022+ support required)
**Project Type**: Single-page web application (Vue 3 SPA)
**Performance Goals**: Language switching <1 second, initial page load <2 seconds on 3G, UI response <100ms
**Constraints**: Offline-capable (no server required), <500KB bundle size (gzipped), must work without network
**Scale/Scope**: Support 2 languages initially (English, French), 95%+ translation coverage, extensible architecture for future languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Offline-First Architecture
**Status**: ✅ PASS
- Language preferences stored in localStorage (offline-capable)
- Translation files bundled with application (no network required)
- No external API dependencies for i18n functionality

### Principle II: Component-Based UI
**Status**: ✅ PASS
- Language switcher will be a reusable Vue 3 component
- Translation composable for shared functionality across components
- Follows Composition API pattern

### Principle III: Type Safety (NON-NEGOTIABLE)
**Status**: ✅ PASS
- All i18n types will be strictly typed (language codes, translation keys, locale formats)
- No `any` type usage
- TypeScript strict mode enabled (already configured)

### Principle IV: User-Centric Design
**Status**: ✅ PASS
- Language switcher accessible from settings menu on all pages
- Immediate visual feedback on language change (<1 second)
- Responsive design for mobile, tablet, desktop

### Principle V: Data Integrity
**Status**: ✅ PASS
- Language preference persisted immediately to localStorage
- No data loss on language switch (state maintained)
- Graceful fallback to English for missing translations

**Overall Assessment**: ✅ ALL GATES PASSED - Proceeding to Phase 0

### Post-Design Re-evaluation (After Phase 1)

**Status**: ✅ ALL PRINCIPLES MAINTAINED

After completing research and design phases, the constitution compliance remains solid:

#### Principle I: Offline-First Architecture
- ✅ **MAINTAINED**: Translation files bundled in build (~14-22 KB total)
- ✅ **MAINTAINED**: No CDN or API dependencies for translations
- ✅ **MAINTAINED**: localStorage used for preference storage
- ✅ **MAINTAINED**: Native Intl API for formatting (no external services)

#### Principle II: Component-Based UI
- ✅ **MAINTAINED**: LanguageSwitcher is a reusable Vue 3 component
- ✅ **MAINTAINED**: useI18n() and useLocale() composables follow Composition API
- ✅ **MAINTAINED**: Clear separation of concerns (service/composable/component layers)

#### Principle III: Type Safety (NON-NEGOTIABLE)
- ✅ **MAINTAINED**: All types defined in contracts/i18n-types.ts
- ✅ **MAINTAINED**: MessageSchema derived from en.json for type-safe keys
- ✅ **MAINTAINED**: Strict TypeScript mode, zero `any` usage
- ✅ **MAINTAINED**: Type guards for runtime validation (isLocale, isLanguagePreference)

#### Principle IV: User-Centric Design
- ✅ **MAINTAINED**: Language switcher in settings menu (user preference confirmed in clarification)
- ✅ **MAINTAINED**: Immediate visual feedback (<100ms locale switch)
- ✅ **MAINTAINED**: Responsive design (works on mobile, tablet, desktop)
- ✅ **MAINTAINED**: Graceful fallback to English prevents broken UI

#### Principle V: Data Integrity
- ✅ **MAINTAINED**: Preference persisted immediately to localStorage
- ✅ **MAINTAINED**: No data loss during language switch (state maintained per FR-009)
- ✅ **MAINTAINED**: Fallback mechanism prevents missing translations (FR-008)
- ✅ **MAINTAINED**: Validation on preference load/save

**Bundle Size Impact**: 14-22 KB (3-4% of 500 KB budget) ✅ Within constraints

**Performance Validation**: Locale switching <100ms (10x better than 1 second target) ✅ Exceeds requirements

**Overall Re-evaluation**: ✅ **NO VIOLATIONS** - All constitutional principles upheld in final design

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
├── components/          # Vue components
│   └── LanguageSwitcher.vue  # NEW: Language selection component
├── composables/         # Vue composition functions
│   ├── useI18n.ts      # NEW: i18n composable for translations
│   └── useLocale.ts    # NEW: Locale formatting composable
├── models/              # Data models
│   └── (existing Session.ts, Event.ts)
├── services/            # Business logic
│   ├── db.ts           # Existing Dexie database
│   └── i18n.ts         # NEW: i18n service layer
├── locales/             # NEW: Translation files
│   ├── en.json         # English translations
│   ├── fr.json         # French translations
│   └── index.ts        # Locale registry
├── types/               # NEW: TypeScript type definitions
│   └── i18n.ts         # i18n-specific types
└── utils/
    └── (existing markdown.ts, etc.)

tests/                   # Test files (structure TBD)
└── (future test organization)
```

**Structure Decision**: Single project structure (Vue 3 SPA). The i18n feature adds new directories (`locales/`, `types/`) and new files to existing directories (`composables/`, `components/`, `services/`). This maintains consistency with the existing GameSessionLogger architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
