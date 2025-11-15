# Research: Game Session Event Logging

**Feature**: 001-event-logging
**Date**: 2025-11-14
**Phase**: 0 - Technology Research & Decisions

## Purpose

This document captures technology decisions, best practices research, and pattern selections for implementing the game session event logging feature.

## Technology Decisions

### IndexedDB Wrapper Library

**Decision**: Use Dexie.js 4.x

**Rationale**:
- Provides TypeScript-first API with excellent type inference
- Simplifies IndexedDB's complex transaction model with Promise-based API
- Supports reactive queries (live queries) for automatic UI updates
- Well-maintained with active community (50k+ weekly downloads)
- Small bundle size (~20KB gzipped) fits within 500KB budget
- Handles versioning and migrations cleanly

**Alternatives Considered**:
- **Raw IndexedDB**: Rejected due to verbose API, complex error handling, and poor TypeScript support
- **localForage**: Rejected because it abstracts away IndexedDB specifics, making schema management harder
- **idb (Jake Archibald)**: Good lightweight option but lacks live queries and has less comprehensive TypeScript support than Dexie

### State Management Pattern

**Decision**: Vue 3 Composables with Reactive Storage

**Rationale**:
- Composition API's `ref()` and `reactive()` provide sufficient reactivity for single-user local app
- No need for Pinia/Vuex complexity when all state comes from IndexedDB
- Composables (`useSessionStore`, `useEventStore`) encapsulate business logic and maintain single source of truth
- Dexie's `liveQuery()` can wrap IndexedDB queries in Vue's reactivity system
- Simpler testing - composables are just functions

**Alternatives Considered**:
- **Pinia**: Rejected as overkill for offline-only, single-user application with no complex state synchronization
- **Vuex**: Rejected for same reasons as Pinia, plus it's legacy (Pinia is official recommendation)

### Clipboard API Approach

**Decision**: Navigator Clipboard API with fallback messaging

**Rationale**:
- Modern Clipboard API (`navigator.clipboard.writeText()`) is supported in all target browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Returns Promise for async handling and error detection
- Requires user gesture (click) which aligns with our "Copy to Clipboard" button UX
- For unsupported browsers (unlikely given our target), show user-friendly error message instead of complex fallback
- Markdown table is plain text, so `writeText()` is sufficient (no need for `write()` with rich formats)

**Alternatives Considered**:
- **document.execCommand('copy')**: Deprecated, not recommended for new projects
- **Complex fallback with textarea**: Adds code complexity for minimal benefit given modern browser support

### Tailwind CSS Configuration

**Decision**: Tailwind CSS 4.x (latest) with modern CSS features

**Rationale**:
- Latest version with improved performance and modern CSS features
- Native CSS layer support for better cascade management
- Enhanced JIT compilation (now default and optimized)
- Automatic unused style purging in production builds
- Utility-first approach aligns with rapid iteration needs
- Component-scoped usage prevents style conflicts
- Built-in responsive utilities (`sm:`, `md:`, `lg:`) simplify mobile/tablet/desktop support

**Best Practices to Follow**:
- Use `@apply` sparingly (only for frequently repeated patterns)
- Prefer utility classes in templates for clarity
- Use Tailwind's spacing scale consistently (e.g., `p-4`, `mb-2`)
- Leverage `dark:` variant if future dark mode needed
- Use Tailwind 4's improved arbitrary value syntax when needed

### Component Architecture Pattern

**Decision**: Smart/Dumb Component Pattern

**Rationale**:
- **Smart components** (e.g., `EventLogger.vue`): Handle data fetching, state management via composables, business logic
- **Dumb components** (e.g., `EventCard.vue`): Receive data via props, emit events, purely presentational
- Clear separation of concerns improves testability
- Dumb components are highly reusable
- Aligns with Vue 3 Composition API best practices

**Component Responsibilities**:
- `SessionSelector.vue` (Smart): Manages active session state, creates/switches sessions
- `EventLogger.vue` (Smart): Handles event creation, validates input, calls event store
- `EventList.vue` (Smart): Fetches events for active session, handles bulk delete
- `EventCard.vue` (Dumb): Displays single event, emits delete event, manages inline confirmation UI
- `MarkdownExporter.vue` (Smart): Formats events as markdown table, handles clipboard API

### TypeScript Configuration

**Decision**: Strict mode with Vue-specific type helpers

**Rationale**:
- `"strict": true` in tsconfig.json enforces all strictness flags
- Use Vue's `defineProps<Props>()` and `defineEmits<Emits>()` for compile-time type checking
- Define interfaces in `/models` for all entities (Session, Event)
- Use `ref<Type>()` and `Ref<Type>` for explicit type annotations
- Enable `"noImplicitAny": true` to catch missing type definitions

**Key Practices**:
- No `any` types except for truly dynamic data (none expected in this feature)
- Use `unknown` instead of `any` when type is uncertain, then narrow with type guards
- Define return types explicitly for all composable functions
- Use `as const` for readonly data (e.g., event tag array)

### Responsive Design Strategy

**Decision**: Mobile-first Tailwind breakpoints

**Rationale**:
- Start with mobile layout (default, no prefix)
- Add complexity at larger breakpoints (`sm:`, `md:`, `lg:`)
- Aligns with "mobile tablet desktop" requirement
- Tailwind's default breakpoints match common device sizes:
  - `sm: 640px` (large phones, small tablets)
  - `md: 768px` (tablets)
  - `lg: 1024px` (desktops)

**Layout Decisions**:
- **Mobile**: Single column, stacked components, full-width buttons
- **Tablet**: Two-column where appropriate (session selector + events), larger touch targets
- **Desktop**: Optimized for mouse input, horizontal layouts, keyboard shortcuts

### Performance Optimization Strategies

**Decision**: Lazy loading and virtual scrolling for event lists

**Rationale**:
- Spec requires support for 100+ events per session without degradation
- Virtual scrolling (e.g., `vue-virtual-scroller` or custom solution) renders only visible items
- Lazy load images/heavy components if added in future features
- IndexedDB queries are already async, leverage pagination/cursors for large datasets

**Implementation Notes**:
- Start with simple array rendering; add virtual scrolling if performance testing shows degradation at 100+ events
- Use `v-memo` directive for EventCard to memoize rendering when props haven't changed
- Debounce description input if auto-save is implemented

### Error Handling Pattern

**Decision**: User-friendly toast notifications + console logging

**Rationale**:
- Offline-first means most errors are client-side (storage quota, clipboard permissions)
- Toast notifications provide immediate visual feedback without blocking UI
- Console logging helps debugging during development
- No error tracking service needed for single-user local app

**Error Categories**:
- **Storage errors**: "Storage limit reached. Please delete old sessions."
- **Clipboard errors**: "Could not copy to clipboard. Please check browser permissions."
- **Validation errors**: Inline form validation messages

## Open Questions Resolved

### Q: Which IndexedDB wrapper?
**A**: Dexie.js for TypeScript support and live queries

### Q: Do we need Pinia for state management?
**A**: No, composables with Dexie's reactive queries are sufficient

### Q: How to handle older browsers without Clipboard API?
**A**: Show error message; acceptable given target browser versions (Chrome 90+, etc.)

### Q: Virtual scrolling necessary from the start?
**A**: No, implement if performance testing shows issues with 100+ events

### Q: Auto-save or explicit save button for events?
**A**: Clarified in spec - explicit button (tag click triggers save)

## References

- Dexie.js Documentation: https://dexie.org/
- Vue 3 Composition API Guide: https://vuejs.org/guide/extras/composition-api-faq.html
- Clipboard API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- Tailwind CSS JIT: https://tailwindcss.com/docs/upgrade-guide#migrating-to-the-jit-engine
- IndexedDB Best Practices: https://web.dev/indexeddb-best-practices/
