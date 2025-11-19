# Research: Session Type Classification

**Feature**: 003-session-typing
**Date**: 2025-11-18
**Status**: Complete

## Overview

This document captures technical research and decision-making for implementing session type classification in the GameSessionLogger application. The feature extends the existing application to support multiple session types (RPG, Boardgame) with type-specific event tags.

## Key Technical Decisions

### 1. IndexedDB Schema Migration Strategy

**Decision**: Use Dexie.js version upgrade mechanism with automatic migration in constructor

**Rationale**:
- Dexie.js provides built-in schema versioning via `.version()` API
- Automatic migration runs on first database open after upgrade
- No user intervention required - seamless upgrade experience
- Supports adding new fields to existing tables without data loss
- Migration logic is declarative and maintainable

**Implementation Approach**:
```typescript
// Current (v1): sessions table with 'id, createdAt' index
// New (v2): sessions table with 'id, type, createdAt' index
this.version(2).stores({
  sessions: 'id, type, createdAt',  // Add type field
  events: 'id, [sessionId+timestamp]' // Unchanged
}).upgrade(tx => {
  // Migration: assign 'RPG' to all existing sessions
  return tx.table('sessions').toCollection().modify(session => {
    if (!session.type) {
      session.type = 'RPG';
    }
  });
});
```

**Alternatives Considered**:
- **Manual migration script**: Rejected - requires user action, more error-prone
- **Separate migration table**: Rejected - adds complexity, Dexie handles this internally
- **Default value in schema**: Rejected - doesn't handle existing data, only new records

**Best Practices**:
- Never decrease version number
- Keep migration logic idempotent (safe to run multiple times)
- Test migration with actual production data scenarios
- Log migration completion for debugging

**References**:
- Dexie.js Version Documentation: https://dexie.org/docs/Tutorial/Design#database-versioning
- Schema upgrade best practices: https://dexie.org/docs/Tutorial/Design#database-versioning

---

### 2. Session Type Representation

**Decision**: Use TypeScript union literal type `'RPG' | 'Boardgame'` with const arrays for iteration

**Rationale**:
- Union literals provide compile-time type safety
- Discriminated unions enable exhaustive type checking
- Const arrays allow runtime iteration (e.g., for select dropdowns)
- No enum overhead - compiles to simple strings
- Easy to extend with new types in future

**Implementation Approach**:
```typescript
// models/SessionType.ts
export const SESSION_TYPES = ['RPG', 'Boardgame'] as const;
export type SessionType = typeof SESSION_TYPES[number];

export function isValidSessionType(value: unknown): value is SessionType {
  return SESSION_TYPES.includes(value as SessionType);
}

export function normalizeSessionType(value: unknown): SessionType {
  return isValidSessionType(value) ? value : 'RPG';
}
```

**Alternatives Considered**:
- **TypeScript enum**: Rejected - adds runtime overhead, less idiomatic for string unions
- **String constants**: Rejected - no compile-time exhaustiveness checking
- **Number codes**: Rejected - less readable in database, harder to debug

**Best Practices**:
- Always provide validation function for runtime type narrowing
- Provide normalization function for invalid/corrupted data handling
- Use `as const` to ensure array is treated as readonly tuple
- Export both the array and the type for maximum flexibility

---

### 3. Type-Specific Tag Mapping

**Decision**: Single source of truth mapping object with type-safe accessors

**Rationale**:
- Centralized configuration - easy to modify tag lists
- Type-safe lookups prevent typos and runtime errors
- Supports future extensibility (new types, custom tags per type)
- Separates data (tags) from logic (components)

**Implementation Approach**:
```typescript
// utils/sessionTypeTags.ts
import { EventTag } from '../models/Event';
import { SessionType } from '../models/SessionType';

type TagsByType = Record<SessionType, readonly EventTag[]>;

const RPG_TAGS: readonly EventTag[] = ['Combat', 'Roleplay', 'Downtime', 'Scoring', 'Meal', 'Other'];
const BOARDGAME_TAGS: readonly EventTag[] = ['Setup', 'Turn', 'Round', 'Scoring', 'Teardown', 'Other'];

export const SESSION_TYPE_TAGS: TagsByType = {
  RPG: RPG_TAGS,
  Boardgame: BOARDGAME_TAGS,
};

export function getTagsForSessionType(type: SessionType): readonly EventTag[] {
  return SESSION_TYPE_TAGS[type];
}
```

**Alternatives Considered**:
- **Switch statement in component**: Rejected - duplicates logic, harder to test
- **Computed property per type**: Rejected - not maintainable as types grow
- **Configuration file (JSON)**: Rejected - loses type safety

**Best Practices**:
- Use `readonly` arrays to prevent accidental mutation
- Export both the mapping object and accessor function
- Keep tag definitions close to usage (co-located files)
- Document tag semantics if meanings are ambiguous

---

### 4. Component Integration Strategy

**Decision**: Modify existing components (SessionSelector, EventLogger) rather than creating new wrapper components

**Rationale**:
- Maintains single responsibility principle - components already own their domains
- Reduces component tree depth - better performance
- Avoids prop drilling - type is already available in session context
- Simpler mental model for developers - fewer files to navigate

**Implementation Approach**:
```typescript
// SessionSelector.vue modifications:
// - Add <select> for session type in createSession form
// - Validate type is selected before allowing submission
// - Display type icon + tooltip in session list items

// EventLogger.vue modifications:
// - Import getTagsForSessionType utility
// - Compute available tags based on current session type
// - Render tag buttons dynamically from computed array
```

**Alternatives Considered**:
- **New TypedSessionSelector wrapper**: Rejected - unnecessary abstraction
- **Separate RPG/Boardgame components**: Rejected - massive duplication
- **Higher-order component pattern**: Rejected - not idiomatic in Vue 3 Composition API

**Best Practices**:
- Use computed properties for derived state (available tags)
- Emit events for type selection to maintain unidirectional data flow
- Add new props with sensible defaults for backward compatibility
- Test modified components in isolation with mocked dependencies

---

### 5. Internationalization Integration

**Decision**: Add session type translation keys to existing locale files, use `$t()` in templates

**Rationale**:
- Consistent with feature 002-i18n architecture
- Leverages existing vue-i18n infrastructure
- No additional bundle size impact
- Maintains language preference from localStorage

**Implementation Approach**:
```json
// locales/en.json
{
  "sessionType": {
    "label": "Session Type",
    "rpg": "RPG",
    "boardgame": "Boardgame",
    "required": "Please select a session type"
  }
}

// locales/fr.json
{
  "sessionType": {
    "label": "Type de session",
    "rpg": "JdR",
    "boardgame": "Jeu de plateau",
    "required": "Veuillez sélectionner un type de session"
  }
}
```

**Template Usage**:
```vue
<select v-model="sessionType" required>
  <option value="">{{ $t('sessionType.label') }}</option>
  <option value="RPG">{{ $t('sessionType.rpg') }}</option>
  <option value="Boardgame">{{ $t('sessionType.boardgame') }}</option>
</select>
```

**Alternatives Considered**:
- **Hardcode English labels**: Rejected - violates i18n principle from constitution
- **Separate i18n file for types**: Rejected - unnecessary file proliferation
- **Dynamic keys (computed)**: Rejected - harder to track unused keys

**Best Practices**:
- Nest keys under `sessionType` namespace for organization
- Provide translations in all supported languages simultaneously
- Use descriptive key names that indicate context
- Test with language switcher to verify all labels translate

---

### 6. Icon Selection and Accessibility

**Decision**: Use Unicode emoji characters with native browser tooltip via `title` attribute

**Rationale**:
- Zero bundle size impact (no icon library required)
- Cross-platform consistency (OS-native emoji rendering)
- Accessible by default (screen readers announce emoji alt text)
- Tooltip support built into HTML spec (no JS required)
- Responsive without media queries

**Implementation Approach**:
```vue
<template>
  <span
    class="session-type-icon"
    :title="$t(`sessionType.${session.type.toLowerCase()}`)"
    role="img"
    :aria-label="$t(`sessionType.${session.type.toLowerCase()}`)"
  >
    {{ sessionTypeIcon(session.type) }}
  </span>
</template>

<script setup lang="ts">
function sessionTypeIcon(type: SessionType): string {
  return type === 'RPG' ? '🎲' : '🎯';
}
</script>
```

**Icon Choices**:
- **RPG**: 🎲 (dice) - universally recognized for role-playing games
- **Boardgame**: 🎯 (target/game piece) - represents strategic gameplay

**Alternatives Considered**:
- **SVG icons**: Rejected - adds complexity, bundle size, not significantly better
- **Icon font (FontAwesome)**: Rejected - dependency overhead for 2 icons
- **CSS shapes**: Rejected - not distinctive enough, accessibility issues
- **Image files**: Rejected - HTTP requests, caching complexity

**Best Practices**:
- Always include `role="img"` for semantic HTML
- Provide `aria-label` for screen reader accessibility
- Use `title` attribute for hover tooltip (native browser support)
- Choose emoji that are widely supported (Unicode 6.0+)
- Test emoji rendering across target browsers

**Accessibility Notes**:
- Screen readers will announce: "RPG, image" or "Boardgame, image"
- Keyboard users can tab to session items and hear the type
- Tooltip appears on hover without JS (native HTML behavior)
- High contrast modes preserve emoji visibility

---

## Technical Risks and Mitigations

### Risk 1: Database Migration Failure

**Likelihood**: Low
**Impact**: High (data loss, application crash)

**Mitigation**:
- Test migration with production-like data before release
- Keep v1 schema functional during development
- Add error handling in migration logic with fallback
- Log migration success/failure for debugging
- Implement rollback capability (downgrade to v1 if needed)

### Risk 2: Tag List Mismatch After Type Change

**Likelihood**: N/A (out of scope - type is immutable)
**Impact**: N/A

**Mitigation**: Type cannot be changed after creation in this feature. If future enhancement adds type editing, validate that no events exist before allowing change, or implement tag remapping logic.

### Risk 3: Browser Compatibility for Emoji Icons

**Likelihood**: Low (Unicode 6.0+ widely supported)
**Impact**: Medium (icons may not render, but functionality intact)

**Mitigation**:
- Choose emoji from older Unicode versions (higher compatibility)
- Provide alt text via `aria-label` for screen readers
- Test on target browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Consider fallback to text labels if emoji rendering issues detected

---

## Performance Considerations

### Database Query Performance
- **Impact**: IndexedDB schema v2 adds `type` index
- **Optimization**: Type is included in compound index `id, type, createdAt`
- **Expected**: No performance degradation (type is small string field)
- **Monitoring**: Track query times for session retrieval

### Component Re-rendering
- **Impact**: EventLogger must re-compute tags when session changes
- **Optimization**: Use Vue `computed()` for memoization
- **Expected**: <1ms recomputation time (simple array lookup)
- **Monitoring**: Add performance mark in devtools

### Bundle Size
- **Impact**: +2 new files (SessionType.ts, sessionTypeTags.ts), minimal code
- **Optimization**: No new dependencies, tree-shakeable exports
- **Expected**: <5KB increase (well under 20KB budget)
- **Monitoring**: Run `vite build` and compare bundle sizes

---

## Security Considerations

### Input Validation
- **Threat**: Malicious user could inject invalid type via DevTools/localStorage manipulation
- **Mitigation**: `normalizeSessionType()` function sanitizes to 'RPG' if invalid
- **Defense-in-Depth**: TypeScript types prevent invalid values at compile time

### Data Integrity
- **Threat**: IndexedDB corruption could lead to sessions with missing type field
- **Mitigation**: Migration adds type to all existing sessions; normalization handles edge cases
- **Validation**: `isValidSessionType()` guards all type accesses

---

## Testing Strategy

### Unit Tests (Optional)
- `SessionType.spec.ts`: Test validation and normalization functions
- `sessionTypeTags.spec.ts`: Test tag retrieval for all types

### Integration Tests (Optional)
- Database migration: Verify v1 → v2 upgrade assigns 'RPG' to existing sessions
- Component behavior: Verify EventLogger displays correct tags per type

### E2E Tests (Optional)
- `session-typing.spec.ts`:
  - Create RPG session → verify RPG tags shown
  - Create Boardgame session → verify Boardgame tags shown
  - Verify type icon displays with tooltip

### Manual Testing Checklist
- [ ] Create RPG session, verify tags: Combat, Roleplay, Downtime, Scoring, Meal, Other
- [ ] Create Boardgame session, verify tags: Setup, Turn, Round, Scoring, Teardown, Other
- [ ] Switch between sessions, verify tag list updates
- [ ] Hover over session type icon, verify tooltip shows type name
- [ ] Change language, verify type labels translate
- [ ] Existing sessions show RPG icon after upgrade
- [ ] Invalid type in DevTools normalizes to RPG without error

---

## Open Questions / Future Enhancements

### Future Consideration: Custom Tags Per Session
- **Question**: Should users define custom tags per session?
- **Decision**: Out of scope for this feature (see spec.md)
- **Future Work**: Could extend SessionType model to support custom tag arrays

### Future Consideration: Type Editing
- **Question**: Should users change session type after creation?
- **Decision**: Out of scope for this feature (see spec.md)
- **Future Work**: Would require event tag remapping or validation (no events exist)

### Future Consideration: Type Statistics
- **Question**: Should dashboard show counts by session type?
- **Decision**: Out of scope for this feature (see spec.md)
- **Future Work**: Could add analytics view with type breakdown

---

## References

### Dexie.js Documentation
- Schema Versioning: https://dexie.org/docs/Tutorial/Design#database-versioning
- Migration Guide: https://dexie.org/docs/Tutorial/Design#database-versioning
- Upgrade Transactions: https://dexie.org/docs/Dexie/Dexie.version()

### TypeScript Best Practices
- Union Types: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
- Const Assertions: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
- Type Guards: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates

### Vue 3 Composition API
- Computed Properties: https://vuejs.org/guide/essentials/computed.html
- Reactivity Fundamentals: https://vuejs.org/guide/essentials/reactivity-fundamentals.html

### vue-i18n Integration
- Translation API: https://vue-i18n.intlify.dev/guide/essentials/syntax.html
- Locale Messages: https://vue-i18n.intlify.dev/guide/essentials/locale.html

### Web Accessibility
- ARIA Labels: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
- Semantic HTML: https://developer.mozilla.org/en-US/docs/Web/HTML/Element
- Emoji Accessibility: https://adrianroselli.com/2016/12/accessible-emoji.html

---

**Research Complete**: 2025-11-18
**Next Phase**: Phase 1 - Data Model & Contracts Design
