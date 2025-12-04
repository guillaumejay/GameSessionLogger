# Game Session Logger

A simple, efficient web application for logging game session events with tags and timestamps. Perfect for tabletop RPG sessions, board game playthroughs, or any gaming session where you want to keep track of what happened.

Mostly AI-coded using [Github Spec-kit]([https://github.com/github/spec-kit)

## Features

- **Session Management**: Create and manage multiple game sessions
- **Session Types**: Choose between RPG and Boardgame sessions with type-specific event tags
- **Quick Event Logging**: Log events with predefined tags
  - RPG: Combat, Roleplay, Meta, Adventuring, Meal, Other
  - Boardgame: Setup, Turn, Round, Scoring, Teardown, Other
- **Event Duration Tracking**:
  - Close events manually with "Close [Tag]" button
  - Auto-close previous event when adding a new one
  - View duration in human-readable format (e.g., "45 min", "1h 20min")
  - "Ongoing" badge for active events
- **Optional Descriptions**: Add detailed descriptions to events (up to 500 characters)
- **Export to Markdown**: Copy events as a markdown table (includes duration) for sharing on Discord, Slack, GitHub, or Notion
- **Multi-language Support**: English and French
- **Persistent Storage**: All data stored locally in IndexedDB - no server required
- **Keyboard Shortcuts**:
  - `Ctrl+Enter`: Log event with "Other" tag
  - `Escape`: Clear description field
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Vue 3.5** with Composition API
- **TypeScript 5.9** (strict mode)
- **Tailwind CSS 4.1** for styling
- **Dexie.js 4.2** for IndexedDB management
- **vue-i18n 11.x** for internationalization
- **SweetAlert2** for notifications
- **Vite 7.2** for build tooling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/guillaumejay/GameSessionLogger.git
cd GameSessionLogger

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Create a Session**: Click "Add RPG Session" or "Add Boardgame Session", enter a name
2. **Log Events**: Click on event tag buttons to log events (previous event auto-closes)
3. **Close Events**: Click "Close [Tag]" button to manually end an event
4. **View Duration**: Closed events show their duration; open events show "Ongoing"
5. **Export Events**: Click the clipboard icon to copy all events as a markdown table
6. **Delete Events**:
   - Individual: Click "Delete" on an event card
   - Bulk: Click trash icon in the event list header
7. **Delete Sessions**: Hover over a session and click the trash icon
8. **Change Language**: Use the language switcher in the header

## Project Structure

```
src/
├── components/          # Vue components
│   ├── EventCard.vue
│   ├── EventLogger.vue
│   ├── EventList.vue
│   ├── LanguageSwitcher.vue
│   ├── MarkdownExporter.vue
│   └── SessionSelector.vue
├── composables/         # Vue composables (state management)
│   ├── useAppVersion.ts
│   ├── useClipboard.ts
│   ├── useEventStore.ts
│   ├── useI18n.ts
│   ├── useSessionStore.ts
│   └── useToast.ts
├── models/              # TypeScript interfaces and validation
│   ├── Event.ts
│   ├── Session.ts
│   └── SessionType.ts
├── services/            # Database services
│   └── db.ts
├── utils/               # Utility functions
│   ├── duration.ts
│   ├── markdown.ts
│   └── sessionTypeTags.ts
├── locales/             # i18n translations
│   ├── en.json
│   └── fr.json
├── App.vue              # Root component
└── main.ts              # Application entry point
```

## License

MIT License - Copyright (c) 2025 Guillaume JAY

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Guillaume JAY - [GitHub](https://github.com/guillaumejay)
