# Feature Specification: Internationalization (i18n)

**Feature Branch**: `002-i18n`
**Created**: 2025-11-16
**Status**: Draft
**Input**: User description: "add i8n : for now, only english and french"

## Clarifications

### Session 2025-11-16

- Q: What is the translation quality requirement for French text? → A: Machine translation with human review (moderate quality, faster delivery)
- Q: Where should the language switcher be located in the interface? → A: User settings/preferences menu (organized but requires navigation)
- Q: How should translations handle dynamic content and variables? → A: Named placeholders (e.g., "Hello {username}") - clear, maintainable
- Q: How should the system handle pluralization in translations? → A: ICU Message Format (industry standard, handles complex rules)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Language Selection (Priority: P1)

Users can select their preferred language (English or French) for the application interface, and all visible text updates accordingly. The selected language preference persists across sessions.

**Why this priority**: This is the foundational feature enabling internationalization. Without language selection, users cannot access translated content, making this the most critical user journey.

**Independent Test**: Can be fully tested by selecting a language from a language switcher and verifying that the interface updates to show translated text. Delivers immediate value by making the application accessible to non-English speakers.

**Acceptance Scenarios**:

1. **Given** the application is loaded for the first time, **When** the user visits any page, **Then** the interface displays in the browser's default language (English or French) if supported, otherwise defaults to English
2. **Given** the user is viewing the application in English, **When** they navigate to settings/preferences and select French from the language switcher, **Then** all interface text immediately updates to French
3. **Given** the user has selected French as their language, **When** they close and reopen the application, **Then** the interface displays in French (preference is persisted)
4. **Given** the user is viewing the application in French, **When** they navigate to settings/preferences and select English from the language switcher, **Then** all interface text immediately updates to English

---

### User Story 2 - Session and Event Logging in Selected Language (Priority: P2)

Users see all session logging interface elements, labels, buttons, and messages in their selected language. This includes session creation, event logging, and viewing session history.

**Why this priority**: This extends language support to the core functionality of the application. It's P2 because it builds on the language selection foundation (P1) and ensures the primary use case is fully internationalized.

**Independent Test**: Can be tested by switching to French and performing complete session logging workflows (create session, log events, view history) to verify all elements are translated.

**Acceptance Scenarios**:

1. **Given** the user has selected French, **When** they create a new game session, **Then** all form labels, placeholders, and buttons appear in French
2. **Given** the user has selected French, **When** they log an event during a session, **Then** event type options, input labels, and confirmation messages appear in French
3. **Given** the user has selected French, **When** they view their session history, **Then** column headers, status labels, and action buttons appear in French
4. **Given** the user has selected English, **When** they navigate through any session logging interface, **Then** all text elements appear in English

---

### User Story 3 - Error Messages and Notifications in Selected Language (Priority: P3)

Users receive all system feedback, error messages, validation messages, and notifications in their selected language.

**Why this priority**: This ensures a complete internationalized experience but is P3 because users can still accomplish core tasks even if some error messages remain in English initially.

**Independent Test**: Can be tested by triggering various validation errors and system notifications while in French mode to verify all feedback messages are translated.

**Acceptance Scenarios**:

1. **Given** the user has selected French, **When** they submit invalid data in a form, **Then** validation error messages appear in French
2. **Given** the user has selected French, **When** they successfully complete an action, **Then** success notifications appear in French
3. **Given** the user has selected French, **When** a system error occurs, **Then** error messages appear in French
4. **Given** the user has selected English, **When** they interact with the application, **Then** all feedback messages appear in English

---

### Edge Cases

- What happens when a translation is missing for a specific text key? (System should fall back to English and log a warning)
- How does the system handle language switching mid-session? (Should update all visible text immediately without data loss)
- What happens if the browser's default language is neither English nor French? (System should default to English)
- How are date, time, and number formats handled for each language? (Should follow locale conventions - French uses DD/MM/YYYY and 24h time, English uses MM/DD/YYYY and can use 12h/24h)
- How are pluralization edge cases handled (e.g., zero, negative numbers)? (ICU Message Format supports explicit rules for zero and handles negative values using absolute value for plural category determination)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support English (en) and French (fr) as selectable interface languages
- **FR-002**: System MUST provide a language switcher control in the user settings/preferences menu, accessible from all application pages
- **FR-003**: System MUST persist user's language preference across browser sessions
- **FR-004**: System MUST detect browser's default language and use it as initial language if supported (English or French), otherwise default to English
- **FR-005**: System MUST update all visible interface text immediately when user changes language selection
- **FR-006**: System MUST translate all user-facing text including labels, buttons, placeholders, error messages, notifications, and help text
- **FR-007**: System MUST format dates, times, and numbers according to the selected language's locale conventions
- **FR-008**: System MUST provide a fallback mechanism to English when a translation key is missing
- **FR-009**: System MUST maintain current application state (user data, navigation position) when switching languages
- **FR-010**: French translations MUST be reviewed by a human after initial machine translation to ensure accuracy and cultural appropriateness
- **FR-011**: Translations MUST support named placeholders (e.g., {username}, {count}) for dynamic content interpolation, allowing translators to reorder variables as needed for proper grammar
- **FR-012**: Translations MUST support pluralization using ICU Message Format to handle language-specific plural rules (e.g., French handles zero, one, and multiple cases differently than English)

### Key Entities

- **Translation**: Represents a localized string with a unique key, language code (en/fr), translated text value, and support for named placeholders (e.g., "Welcome {username}") and ICU Message Format for pluralization (e.g., "{count, plural, =0 {no items} one {# item} other {# items}}")
- **Language Preference**: Represents user's selected language stored in browser local storage with language code and last updated timestamp
- **Locale Settings**: Represents formatting rules for dates, times, and numbers specific to each language

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between English and French with all interface text updating in under 1 second
- **SC-002**: 100% of user-facing interface elements are translatable (no hard-coded text in UI components)
- **SC-003**: Language preference persists correctly across 100% of browser sessions
- **SC-004**: Users can complete all core workflows (session creation, event logging, viewing history) entirely in their selected language
- **SC-005**: All dates and times display in the correct format for the selected language (DD/MM/YYYY for French, MM/DD/YYYY for English)
- **SC-006**: French-speaking users report ability to use the application without encountering English text (95% translation coverage minimum)

## Assumptions

- Browser supports localStorage for persisting language preference
- Users are familiar with their language's standard date/time formats
- English serves as the source language for all translations
- Translation completeness is validated before deployment (missing translations caught in testing)
- French translations will be provided via machine translation with human review to balance quality and delivery speed
- Dynamic content (user-entered data) is not translated - only interface elements
- Two languages are sufficient for initial release; architecture should support adding more languages in future
