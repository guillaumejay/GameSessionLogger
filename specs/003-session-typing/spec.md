# Feature Specification: Session Type Classification

**Feature Branch**: `003-session-typing`
**Created**: 2025-11-18
**Status**: Draft
**Input**: User description: "Session are going to be typed : for now, RPG or Boardgame. The session type will be displayed as an icon on the session list, and for now, the only change between session are the tag lists : for boardgames, it will be "Setup","Turn", "Round", "Scoring","Teardown", and "Other")"

## Clarifications

### Session 2025-11-18

- Q: When a user upgrades to this feature, how should the system handle sessions that were created before session typing existed? → A: Automatically assign "RPG" type to all existing sessions (silent migration, backward compatible)
- Q: Where in the session creation flow should the session type selection appear? → A: Add as mandatory field in existing session creation form (select type with name in same form)
- Q: Should the session type icons include additional visual cues (like tooltips or labels) to help users understand their meaning? → A: Icons with hover tooltips showing type name (accessible and discoverable)
- Q: Should session type names ("RPG", "Boardgame") and their tooltips be internationalized using the existing i18n system from feature 002? → A: Yes, internationalize all session type labels and tooltips (consistent with feature 002)
- Q: How should the system handle a session with an invalid type value (e.g., corrupted data, unexpected value)? → A: Treat invalid types as "RPG" (silent fallback to default, graceful degradation)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Session Type Selection (Priority: P1)

When creating a new game session, a user needs to specify whether they are logging an RPG session or a Boardgame session within the session creation form. The session type field appears alongside the session name field as a mandatory input. The session type determines which event tags will be available for logging events during that session.

**Why this priority**: This is the foundational MVP functionality. Without the ability to select a session type, users cannot access the appropriate event tags for their game type. This must work before any other session typing features.

**Independent Test**: Can be fully tested by opening the session creation form, verifying the type field is present alongside the name field, selecting "RPG" or "Boardgame" as the session type, and verifying that the session is created with the correct type indicator.

**Acceptance Scenarios**:

1. **Given** the user opens the session creation form, **When** they view the form, **Then** the session type field is visible alongside the session name field
2. **Given** the user is in the session creation form, **When** they select "RPG" as the session type, enter a session name, and submit, **Then** the session is created with type "RPG"
3. **Given** the user is in the session creation form, **When** they select "Boardgame" as the session type, enter a session name, and submit, **Then** the session is created with type "Boardgame"
4. **Given** the user is in the session creation form, **When** they enter a session name but do not select a type and attempt to submit, **Then** the system prevents session creation and prompts the user to select a type (type selection is mandatory)

---

### User Story 2 - Type-Specific Event Tags (Priority: P1)

During an active game session, a user needs to log events using tags that are appropriate for their game type. RPG sessions should display RPG-relevant tags, while Boardgame sessions should display boardgame-specific tags (Setup, Turn, Round, Scoring, Teardown, Other).

**Why this priority**: This is core functionality that directly impacts user experience. The entire point of session typing is to provide relevant event tags. Without this, session types have no practical value.

**Independent Test**: Can be fully tested by creating an RPG session and a Boardgame session, then verifying that each displays its respective tag list when logging events.

**Acceptance Scenarios**:

1. **Given** a Boardgame session is active, **When** the user views the event tagging interface, **Then** the available tags are: Setup, Turn, Round, Scoring, Teardown, and Other
2. **Given** an RPG session is active, **When** the user views the event tagging interface, **Then** the available tags are: Combat, Roleplay, Downtime, Scoring, Meal, and Other (same as feature 001)
3. **Given** a user switches from a Boardgame session to an RPG session, **When** the active session changes, **Then** the event tag list updates to show the appropriate tags for the new session type

---

### User Story 3 - Visual Session Type Indicators (Priority: P2)

When viewing the list of all sessions, a user needs to quickly identify which sessions are RPG sessions and which are Boardgame sessions without reading session names. An icon next to each session provides this visual distinction. When the user hovers over an icon, a tooltip displays the session type name (e.g., "RPG" or "Boardgame") to aid discoverability and accessibility.

**Why this priority**: Visual indicators improve usability and help users quickly find the session they want, but the application functions without them. This is a UX enhancement rather than core functionality.

**Independent Test**: Can be fully tested by creating multiple sessions of different types, then verifying that each session displays the appropriate type icon with hover tooltips in the session list.

**Acceptance Scenarios**:

1. **Given** multiple sessions exist with different types, **When** viewing the session list, **Then** each RPG session displays an RPG icon
2. **Given** multiple sessions exist with different types, **When** viewing the session list, **Then** each Boardgame session displays a Boardgame icon
3. **Given** a session list with mixed session types, **When** viewing the list, **Then** users can visually distinguish session types at a glance without reading session names
4. **Given** a user is viewing the session list, **When** they hover over a session type icon, **Then** a tooltip appears showing the type name ("RPG" or "Boardgame")

---

### Edge Cases

- What happens when a session type needs to be changed after creation (e.g., user selected wrong type)? - Out of scope for this feature; may be addressed in future enhancement
- Sessions created before session typing was implemented are automatically assigned "RPG" type during migration to maintain backward compatibility with feature 001
- Addressed: Type selection is mandatory; system prevents session creation without type selection (see User Story 1, scenario 4)
- Sessions with invalid or corrupted type values are treated as "RPG" type for graceful degradation and consistent user experience

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to select a session type (RPG or Boardgame) during session creation
- **FR-002**: System MUST store the session type as part of the session data
- **FR-003**: System MUST display Boardgame-specific event tags (Setup, Turn, Round, Scoring, Teardown, Other) when a Boardgame session is active
- **FR-004**: System MUST display type-appropriate event tags when an RPG session is active
- **FR-005**: System MUST display a visual icon indicator for each session's type in the session list
- **FR-006**: System MUST use distinct icons for RPG and Boardgame session types
- **FR-007**: System MUST display a tooltip showing the session type name when the user hovers over a session type icon
- **FR-008**: System MUST maintain session type when switching between sessions
- **FR-009**: System MUST persist session type information when the application is closed and reopened
- **FR-010**: System MUST automatically assign "RPG" type to all existing sessions that lack a type attribute during data migration
- **FR-011**: System MUST display session type names and tooltips in the user's selected language using the i18n system from feature 002
- **FR-012**: System MUST treat sessions with invalid or unrecognized type values as "RPG" type without displaying errors to the user

### Key Entities

- **Session**: Represents a game session; now includes a `type` attribute that can be "RPG" or "Boardgame". The type determines which event tags are available for logging.
- **Session Type**: A classification (RPG or Boardgame) that defines the available event tag list and visual icon for a session.
- **Event Tag**: Category labels for logged events; the available set is determined by the session type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create sessions with a specific type (RPG or Boardgame) and see type-appropriate event tags immediately
- **SC-002**: 100% of Boardgame sessions display the correct tag list (Setup, Turn, Round, Scoring, Teardown, Other)
- **SC-003**: Users can visually distinguish between session types in the session list without reading session names
- **SC-004**: Session type information persists correctly across application restarts (no data loss)
- **SC-005**: Users can switch between sessions of different types and see the appropriate tag list update in under 1 second

## Assumptions

- Session type is selected during session creation and applies to the entire session
- The existing event logging functionality from feature 001 remains unchanged; only the available tag list varies by session type
- Icons for session types will be simple, recognizable symbols (implementation can use emoji, SVG, or icon fonts)
- RPG sessions will use the same event tags as currently implemented in feature 001 (Combat, Roleplay, Downtime, Scoring, Meal, Other)
- Session type cannot be changed after creation in this feature (future enhancement if needed)
- This feature depends on the internationalization system from feature 002-i18n for displaying localized session type labels

## Scope

### In Scope
- Adding session type selection to session creation flow
- Storing session type with session data
- Displaying type-specific event tags for Boardgame sessions
- Displaying visual type indicators (icons) in session list
- Persisting session type information

### Out of Scope
- Editing/changing session type after creation
- Adding additional session types beyond RPG and Boardgame
- Custom or user-defined event tags
- Different event tag lists for different RPG systems
- Filtering or sorting sessions by type in the session list
- Session type statistics or analytics
