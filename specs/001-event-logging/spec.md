# Feature Specification: Game Session Event Logging

**Feature Branch**: `001-event-logging`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "To log session game events,the user will click on a tag ("Combat", "Roleplay", "Downtime", "Scoring", "Meal", and other game related event), add optionally a descriptive text, and the event will be logged at the current time stamp. A list of event will be displayed (hour: minutes is sufficient), event can be deleted individiually or all of them"

## Clarifications

### Session 2025-11-14

- Q: Are events scoped to sessions, or is there one global event list? → A: Multiple named sessions with session switching (create/select sessions, events scoped per session)
- Q: How does description entry work? → A: Inline text field always visible below tags (click tag → optionally type → auto-save or explicit button)
- Q: What confirmation pattern for individual event deletion? → A: Inline confirmation prompt (click delete → "Are you sure?" appears inline → confirm/cancel)
- Q: What is the event display sort order? → A: Most recent first (reverse chronological - newest at top)
- Q: What markdown format structure for clipboard export? → A: Markdown table (columns: Time, Event Type, Description)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Event Logging (Priority: P1)

During a game session, a game master needs to quickly log events as they happen without interrupting the flow of gameplay. After creating or selecting a named session, they select a predefined event tag using an inline text field (always visible below the tags) to optionally add a brief description, with the system automatically capturing the current timestamp. Events are logged to the currently active session.

**Why this priority**: This is the core MVP functionality. Without the ability to quickly log events with tags within sessions, the application has no value. This must work before any other features.

**Independent Test**: Can be fully tested by creating a new named session, clicking event tags (Combat, Roleplay, Downtime, Scoring, Meal), optionally typing in the always-visible description field below tags, and verifying events appear in the list with correct timestamps in HH:MM format within that session.

**Acceptance Scenarios**:

1. **Given** a named session is active, **When** the user clicks the "Combat" tag without entering text in the description field, **Then** a new event is logged with "Combat" as the tag, current timestamp in HH:MM format, and no description
2. **Given** a named session is active, **When** the user types "Negotiation with merchant" in the always-visible description field and clicks the "Roleplay" tag, **Then** a new event is logged with "Roleplay" as the tag, current timestamp, and the description text
3. **Given** a named session is active, **When** the user clicks the "Meal" tag, **Then** the event appears in the event list immediately with the correct timestamp at the top (most recent first)
4. **Given** multiple events have been logged in the current session, **When** viewing the event list, **Then** events are displayed in reverse chronological order (most recent first) showing tag, timestamp (HH:MM), and description if present

---

### User Story 2 - Event List Management (Priority: P2)

After logging multiple events during a session, a game master needs to view all logged events and remove individual events if they were logged by mistake or are no longer needed. Individual deletion uses an inline confirmation prompt to prevent accidental data loss.

**Why this priority**: Mistakes happen during gameplay. Users need the ability to correct errors without losing all their data. This is essential for data quality but secondary to the core logging functionality.

**Independent Test**: Can be fully tested by logging several events in a session, clicking delete on specific events, confirming via inline prompt, and verifying the correct events are removed while others remain in the list.

**Acceptance Scenarios**:

1. **Given** five events have been logged in the current session, **When** the user clicks delete on the third event and confirms via the inline prompt, **Then** only that event is removed and the remaining four events stay in the list
2. **Given** an event list with multiple events, **When** the user clicks delete on an event, **Then** an inline confirmation prompt appears with confirm/cancel options
3. **Given** only one event remains in the list, **When** the user deletes it and confirms, **Then** the list displays an empty state message

---

### User Story 3 - Copy Events to Clipboard (Priority: P3)

After logging events during a game session, a game master needs to share the session log with players or save it for campaign records. They can copy all logged events from the current session to the clipboard in markdown table format for easy sharing via chat, email, or pasting into documents.

**Why this priority**: Sharing session logs is valuable for campaign documentation and player communication. This enables easy export without complex file handling. More valuable than bulk deletion since it serves communication and record-keeping needs.

**Independent Test**: Can be fully tested by logging multiple events with different tags and descriptions in a session, clicking a "Copy to Clipboard" button, and verifying the clipboard contains a properly formatted markdown table with columns for Time, Event Type, and Description.

**Acceptance Scenarios**:

1. **Given** five events have been logged in the current session, **When** the user clicks "Copy to Clipboard", **Then** all events are copied to the clipboard as a markdown table with Time, Event Type, and Description columns
2. **Given** events with various tags and descriptions, **When** copied to clipboard, **Then** the markdown table includes timestamps (HH:MM), tags, and descriptions in properly aligned columns
3. **Given** the user has copied events to clipboard, **When** pasting into a text editor or chat application (Discord, Slack, GitHub, Notion), **Then** the markdown table renders correctly showing all event information
4. **Given** no events are logged in the current session, **When** the user attempts to copy to clipboard, **Then** an appropriate message is shown indicating there are no events to copy

---

### User Story 4 - Bulk Event Deletion (Priority: P4)

At the end of a session or when starting fresh, a game master needs to clear all logged events from the current session at once rather than deleting them individually.

**Why this priority**: This is a convenience feature that improves user experience but isn't essential for the core workflow. Users can technically delete events individually if needed.

**Independent Test**: Can be fully tested by logging multiple events in a session, clicking "delete all" or similar action, confirming the action, and verifying all events are removed from the current session.

**Acceptance Scenarios**:

1. **Given** ten events have been logged in the current session, **When** the user clicks "Delete All Events" and confirms, **Then** all events are removed from the current session
2. **Given** the user initiates bulk deletion, **When** a confirmation dialog appears, **Then** the user can either confirm or cancel the action
3. **Given** all events have been deleted from the current session, **When** viewing the event list, **Then** an empty state is displayed indicating no events are logged

---

### Edge Cases

- What happens when the user rapidly clicks multiple event tags in quick succession?
- How does the system handle very long description text (e.g., 500+ characters)?
- What happens if the user's system clock is incorrect or changes during a session?
- How does the system behave when local storage is full or unavailable?
- What happens if a user tries to log an event at exactly midnight (00:00) during a session that started before midnight?
- How does the system handle clipboard copying if the browser denies clipboard permissions?
- What happens when copying a very large number of events (e.g., 200+ events) to clipboard?
- How are special characters in event descriptions handled in markdown formatting?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create, name, and select game sessions
- **FR-002**: System MUST scope all events to the currently active session
- **FR-003**: System MUST allow users to switch between different sessions
- **FR-004**: System MUST provide predefined event tags: "Combat", "Roleplay", "Downtime", "Scoring", "Meal", and support custom/other event tags
- **FR-005**: System MUST allow users to select an event tag with a single click/tap
- **FR-006**: System MUST capture the current system time automatically when an event tag is selected
- **FR-007**: System MUST provide an always-visible inline text input field below event tags for users to optionally add descriptive text to each event
- **FR-008**: System MUST display timestamps in HH:MM format (24-hour or 12-hour based on user locale)
- **FR-009**: System MUST display all logged events in a list showing: event tag, timestamp (HH:MM), and description (if provided)
- **FR-010**: System MUST display events in reverse chronological order (most recent first, newest at top)
- **FR-011**: System MUST allow users to delete individual events from the list using an inline confirmation prompt
- **FR-012**: System MUST allow users to delete all events from the current session at once
- **FR-013**: System MUST persist logged events and sessions so they survive page refreshes and browser restarts
- **FR-014**: System MUST provide visual feedback when an event is successfully logged
- **FR-015**: System MUST handle rapid successive event logging without losing data
- **FR-016**: System MUST provide a "Copy to Clipboard" action accessible to users
- **FR-017**: System MUST format all logged events as a valid markdown table when copying to clipboard
- **FR-018**: System MUST use markdown table format with three columns: Time, Event Type, and Description
- **FR-019**: System MUST include all event information in the markdown output: timestamp (HH:MM), tag, and description (if present)
- **FR-020**: System MUST provide visual feedback when events are successfully copied to clipboard
- **FR-021**: System MUST handle clipboard permission errors gracefully and inform the user if copying fails
- **FR-022**: System MUST escape special markdown characters in event descriptions to prevent formatting issues

### Assumptions

- Timestamp format will follow user's browser locale for 12-hour vs 24-hour format
- Description text field has a reasonable character limit (e.g., 500 characters) to prevent storage issues
- The "other game related event" mentioned in the original description will be addressed through a generic "Other" tag or future custom tag feature
- Bulk deletion (delete all) requires explicit confirmation (modal or inline)
- The markdown table output preserves the reverse chronological order of events as they appear in the UI
- Clipboard API is available in modern browsers (fallback behavior for unsupported browsers will be determined during implementation planning)
- Session names are unique (duplicate session names will require disambiguation during implementation planning)
- A session must be selected/created before logging events (onboarding flow to be determined during planning)

### Key Entities

- **Session**: Represents a named game session containing multiple events
  - Session Name: User-provided name to identify the session
  - Created Timestamp: When the session was created
  - Unique identifier: For session switching and data management purposes
  - Relationship: One session contains many events

- **Event**: Represents a single logged occurrence within a game session
  - Event Tag: Predefined category (Combat, Roleplay, Downtime, Scoring, Meal, Other)
  - Timestamp: Date and time when the event was logged (ISO format internally, displayed as HH:MM)
  - Description: Optional user-provided text describing the event
  - Session Reference: Links the event to its parent session
  - Unique identifier: For deletion and data management purposes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new session in under 5 seconds
- **SC-002**: Users can switch between sessions in under 2 seconds
- **SC-003**: Users can log an event in under 3 seconds (tag selection + optional description in inline field + save)
- **SC-004**: The system displays logged events within 100 milliseconds of logging
- **SC-005**: Users can successfully log at least 100 events per session without performance degradation
- **SC-006**: 95% of users can understand how to log an event without instructions on first use
- **SC-007**: All logged events and sessions persist correctly across browser restarts
- **SC-008**: Event deletion (individual with inline confirmation or bulk) completes within 500 milliseconds
- **SC-009**: The interface remains responsive and usable on mobile devices during active gameplay
- **SC-010**: Copying events to clipboard completes within 1 second for up to 100 events
- **SC-011**: The markdown table output is valid and renders correctly in standard markdown viewers (Discord, Slack, GitHub, Notion)
- **SC-012**: 100% of event data (timestamps, tags, descriptions) is preserved in the clipboard markdown table output
