# Research: Event Duration Tracking

**Feature**: 004-event-duration
**Date**: 2025-12-04

## Research Topics

### 1. Dexie.js Schema Migration for Optional Fields

**Decision**: Add `endTimestamp` as an optional field (nullable) to existing Event interface; no Dexie index needed for this field.

**Rationale**:
- Dexie.js handles schema upgrades gracefully - existing records without `endTimestamp` will simply have `undefined` for that field
- No index is needed on `endTimestamp` since we don't query by end time (we query by sessionId+timestamp which is already indexed)
- Migration is automatic - no explicit upgrade function required for adding optional fields

**Alternatives considered**:
- Adding index on `endTimestamp`: Rejected - unnecessary overhead, not queried directly
- Separate "closed events" table: Rejected - over-engineering, breaks existing patterns

### 2. Duration Calculation and Display Format

**Decision**: Calculate duration on-the-fly from `timestamp` and `endTimestamp`; display in human-readable format with i18n support.

**Rationale**:
- Calculating duration on read (not storing) avoids data duplication and ensures accuracy
- Format: `< 1 min` for under 60s, `Xm` for minutes only, `Xh Ym` for hours+minutes
- Using `Intl.RelativeTimeFormat` or simple arithmetic with i18n strings

**Alternatives considered**:
- Store pre-calculated duration: Rejected - redundant data, potential for drift
- Use dayjs/moment: Rejected - unnecessary dependency for simple math

### 3. Auto-Close Previous Event Strategy

**Decision**: In `createEvent()`, query for open events in the session, close the most recent one, then create the new event.

**Rationale**:
- Single transaction ensures atomicity
- Query: `db.events.where('sessionId').equals(sessionId).and(e => !e.endTimestamp)`
- Only one event should be open at a time (enforced by auto-close)

**Alternatives considered**:
- Store "currentOpenEventId" on session: Rejected - denormalization adds complexity
- Close all open events (not just most recent): Considered acceptable fallback if data corrupted

### 4. Backward Compatibility for Legacy Events

**Decision**: Events without `endTimestamp` are treated as closed with unknown duration; display "—" for duration.

**Rationale**:
- Preserves existing data without modification
- Clear visual distinction from actual closed events with duration
- No migration script needed - UI handles null/undefined gracefully

**Alternatives considered**:
- Treat as open: Rejected - confusing UX for old data
- Auto-assign duration of 0: Rejected - misleading data

### 5. UI Component Updates

**Decision**: Extend existing EventCard.vue with conditional close button and duration badge.

**Rationale**:
- Follows existing component patterns
- Close button: visible only when `endTimestamp` is undefined
- Duration/Ongoing badge: shows in same location where close button was
- Tailwind classes for consistent styling

**Alternatives considered**:
- Separate ClosedEventCard/OpenEventCard: Rejected - violates DRY, same structure
- Modal for closing: Rejected - friction during gameplay

### 6. Markdown Export Extension

**Decision**: Add "Duration" column to markdown table export.

**Rationale**:
- Extends existing `formatEventsAsMarkdownTable()` function
- New column: `| Time | Event Type | Duration | Description |`
- Duration shows formatted value or "—" for legacy/open events

**Alternatives considered**:
- Separate export format: Rejected - maintain consistency with existing export

## Summary

All research topics resolved with decisions that:
- Follow existing codebase patterns
- Minimize complexity and new dependencies
- Preserve backward compatibility
- Prioritize user experience during gameplay

No external API calls or complex integrations required - this is a pure client-side feature enhancement.
