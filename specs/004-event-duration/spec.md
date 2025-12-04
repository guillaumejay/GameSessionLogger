# Feature Specification: Event Duration Tracking

**Feature Branch**: `004-event-duration`
**Created**: 2025-12-04
**Status**: Draft
**Input**: User description: "Ending event: when we add an event, a button 'Close' Event name appears on it, we can use it to close the event. Each event will now hold its duration. Adding an event will close the preceding one"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Close Event with Dedicated Button (Priority: P1)

As a game session logger, I want to close an active event using a "Close [Event Tag]" button so that I can explicitly mark when an event ends and track its duration.

**Why this priority**: This is the core feature - without the ability to close events, duration tracking is impossible. It provides the primary user interaction for ending events.

**Independent Test**: Can be fully tested by starting a session, adding an event, clicking the close button, and verifying the event shows its duration.

**Acceptance Scenarios**:

1. **Given** an active session with an open event, **When** the user views the event in the list, **Then** a "Close [Event Tag]" button is displayed on the event card
2. **Given** an event with a visible close button, **When** the user clicks "Close [Event Tag]", **Then** the event is marked as closed with an end timestamp and its duration is calculated and displayed
3. **Given** an event that has been closed, **When** the user views it, **Then** the close button is no longer visible and the duration is displayed instead

---

### User Story 2 - Automatic Event Closure on New Event (Priority: P2)

As a game session logger, I want the system to automatically close the previous event when I add a new one so that I don't have to manually close events during fast-paced gaming moments.

**Why this priority**: This streamlines the logging workflow and prevents user frustration during active gameplay. It builds on the closing mechanism from P1.

**Independent Test**: Can be tested by starting a session, adding an event, then adding another event and verifying the first event is automatically closed with the correct duration.

**Acceptance Scenarios**:

1. **Given** an active session with an open event, **When** the user adds a new event, **Then** the previous event is automatically closed with its end time set to the new event's start time
2. **Given** an active session with an open event, **When** the user adds a new event, **Then** the previous event's duration is calculated and displayed
3. **Given** an active session with no open events (all closed), **When** the user adds a new event, **Then** the new event is created as open without affecting other events

---

### User Story 3 - View Event Duration (Priority: P3)

As a game session logger, I want to see the duration of each closed event so that I can analyze how time was spent during the session.

**Why this priority**: This is the display/presentation aspect that depends on P1 and P2 being implemented. It provides value by making duration data visible.

**Independent Test**: Can be tested by closing multiple events and verifying each displays its duration in a human-readable format.

**Acceptance Scenarios**:

1. **Given** a closed event, **When** the user views the session events, **Then** the event's duration is displayed in a human-readable format (e.g., "45 min", "1h 20min")
2. **Given** multiple closed events, **When** the user views the session events, **Then** each event shows its individual duration
3. **Given** an open event, **When** the user views it, **Then** an "Ongoing" text badge is displayed instead of duration

---

### Edge Cases

- What happens when a session ends with an open event?
  - **Assumption**: The event remains open and can be closed manually later, or shows duration from start to "now" when viewing
- What happens when an event duration is less than 1 minute?
  - **Assumption**: Display as "< 1 min" or show seconds (e.g., "45s")
- What happens when a user tries to close an already closed event?
  - **Assumption**: The close button is not visible on closed events, preventing this scenario
- What happens to existing events without duration data (data migration)?
  - **Decision**: Existing events are treated as closed and display "—" for duration (no end timestamp assumed)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add an end timestamp field to events to track when they are closed
- **FR-002**: System MUST calculate event duration when an event is closed (derived from difference between start and end timestamps)
- **FR-003**: System MUST display a "Close [Event Tag]" button on each open event
- **FR-004**: System MUST automatically close the most recent open event when a new event is created
- **FR-005**: System MUST hide the close button for events that are already closed
- **FR-006**: System MUST display the duration of closed events in human-readable format
- **FR-007**: System MUST preserve backward compatibility with existing events that have no duration data (treat as closed, display "—" for duration)
- **FR-008**: System MUST display an "Ongoing" text badge on open events instead of duration
- **FR-009**: System MUST include event duration in the copy/paste export output for closed events

### Key Entities

- **Event** (updated): Represents a logged moment during a session. Now includes:
  - Start timestamp (existing: `timestamp`)
  - End timestamp (new: when event was closed)
  - Duration (derived at runtime: calculated from start and end timestamps, not stored)
  - Status indicator (derived: open if no end timestamp, closed otherwise)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can close an event with a single click/tap
- **SC-002**: Duration is displayed within 1 second of closing an event
- **SC-003**: When adding a new event, the previous event is closed automatically without additional user action
- **SC-004**: 100% of closed events display accurate duration (calculated correctly from timestamps)
- **SC-005**: Existing session data remains accessible and functional after the update

## Clarifications

### Session 2025-12-04

- Q: How should open events be visually indicated? → A: Show "Ongoing" text badge
- Q: How should existing events without duration data be handled? → A: Treat as closed, show "—" for duration
- Q: Should duration be included in copy/paste export? → A: Yes, include duration for closed events

## Assumptions

- Duration is calculated in minutes/hours for display, with appropriate rounding for short durations
- Only one event can be "open" at a time per session (the most recent one)
- Events are displayed in reverse chronological order (most recent first) as per existing behavior
- The close button text follows the pattern "Close [Tag]" where Tag is the event's tag (e.g., "Close Combat", "Close Setup")
