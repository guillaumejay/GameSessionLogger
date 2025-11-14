<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.0.1
Amendment Type: PATCH (Technical clarification)
Last Amended: 2025-11-14

Changes in v1.0.1:
- Updated Technical Standards > Technology Stack > Styling
- Changed from "CSS Modules or scoped styles" to "Tailwind CSS with component-scoped utility classes"
- Rationale: Clarifies styling approach to align with project technology decisions

Principles: No changes (still 5 core principles)
Sections: No structural changes

Templates Status:
✅ plan-template.md: Compatible (no impact)
✅ spec-template.md: Compatible (no impact)
✅ tasks-template.md: Compatible (no impact)
✅ agent-file-template.md: Compatible (no impact)
✅ checklist-template.md: Compatible (no impact)

Follow-up Actions: None
-->

# GameSessionLogger Constitution

## Core Principles

### I. Offline-First Architecture

The application MUST function entirely without a server or network connection. All data MUST be stored locally in the browser using appropriate Web APIs (localStorage, IndexedDB). No external dependencies on APIs or backends are permitted for core functionality.

**Rationale**: The application is designed for use during game sessions where internet connectivity cannot be assumed. Users must have full access to all features regardless of network status.

### II. Component-Based UI

Every feature MUST be built as reusable Vue 3 components following the Composition API. Components MUST have clear single responsibilities, accept props for configuration, and emit events for communication. Shared UI elements MUST be abstracted into a component library.

**Rationale**: Component-based architecture ensures maintainability, testability, and reusability. The Composition API provides better TypeScript integration and more flexible code organization than Options API.

### III. Type Safety (NON-NEGOTIABLE)

All code MUST be written in TypeScript with strict mode enabled. No use of `any` type except where absolutely necessary with explicit justification. All component props, events, and state MUST be fully typed. No TypeScript errors permitted in builds.

**Rationale**: Type safety prevents runtime errors, improves developer experience with autocomplete, and serves as living documentation. Game session data integrity depends on type correctness.

### IV. User-Centric Design

The UI MUST be responsive and work on mobile, tablet, and desktop devices. The interface MUST be intuitive enough for use during active gameplay without referring to documentation. All user actions MUST provide immediate visual feedback.

**Rationale**: Game masters and players need to quickly log events during sessions without disrupting gameplay flow. The tool must be as frictionless as possible.

### V. Data Integrity

User data MUST never be lost. All state changes MUST be persisted immediately to local storage. The application MUST handle browser storage limits gracefully. Export/import functionality MUST preserve all data without loss.

**Rationale**: Game session logs represent hours of gameplay and are irreplaceable. Data loss would destroy user trust and the tool's value.

## Technical Standards

### Technology Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite (or similar modern bundler)
- **Storage**: localStorage for settings, IndexedDB for session data
- **Styling**: Tailwind CSS with component-scoped utility classes
- **Testing**: Vitest for unit tests, Playwright for E2E tests (when applicable)

### Code Quality

- All code MUST pass ESLint checks with project rules
- All code MUST be formatted with Prettier
- Component complexity MUST be kept low (prefer composition over large components)
- Magic numbers and strings MUST be replaced with named constants
- Business logic MUST be separated from presentation logic

### Performance Standards

- Initial page load MUST be under 2 seconds on 3G connection
- User interactions MUST respond within 100ms
- The application MUST handle at least 100 events per game session without performance degradation
- Bundle size MUST be monitored and kept under 500KB (gzipped)

## Development Workflow

### Feature Development

1. All features MUST start with a specification in `/specs/[###-feature-name]/spec.md`
2. User stories MUST be prioritized and independently testable
3. Implementation MUST follow the task breakdown in `tasks.md`
4. Each user story MUST be validated independently before moving to the next

### Code Review Requirements

- All changes MUST go through pull request review
- PRs MUST include description of what changed and why
- Breaking changes MUST be clearly documented
- Reviewers MUST verify constitution compliance

### Testing Strategy

- Tests are OPTIONAL unless explicitly required in the feature spec
- When tests are required, they MUST be written before implementation (TDD)
- Component tests MUST verify both happy paths and error cases
- E2E tests MUST cover critical user journeys (session creation, event logging, data export)

### Version Control

- Commit messages MUST be clear and descriptive
- Feature branches MUST follow naming: `[###]-feature-name`
- The main branch MUST always be in a deployable state
- No direct commits to main—all changes via pull requests

## Governance

### Authority

This constitution supersedes all other development practices and conventions. In case of conflict between this document and other guidance, this document takes precedence.

### Amendment Procedure

1. Proposed amendments MUST be documented in a PR to this file
2. Amendment rationale MUST explain why the change improves the project
3. Breaking changes MUST include a migration plan for existing code
4. Version MUST be incremented according to semantic versioning:
   - **MAJOR**: Removal or backward-incompatible redefinition of principles
   - **MINOR**: Addition of new principles or major expansions
   - **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance

- All pull requests MUST be reviewed for constitution compliance
- The Constitution Check section in `plan.md` MUST be validated before implementation
- Complexity violations MUST be explicitly justified in the Complexity Tracking table
- Any violation of NON-NEGOTIABLE principles MUST be rejected

### Living Document

This constitution is a living document that evolves with the project. When project needs change, amend this document rather than working around it. Keep principles minimal, clear, and enforceable.

**Version**: 1.0.1 | **Ratified**: 2025-11-14 | **Last Amended**: 2025-11-14
