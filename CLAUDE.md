# GameSessionLogger Development Guidelines

## Tech Stack
- **Language**: TypeScript 5.9.3 (strict mode)
- **Framework**: Vue 3.5.24 + Vite 7.2.2
- **Styling**: Tailwind CSS 4.1.17
- **Storage**: IndexedDB (Dexie.js 4.2.1), localStorage for preferences
- **i18n**: vue-i18n 11.x

## Project Structure
```text
src/
├── components/    # Vue components
├── composables/   # Composition API hooks
├── models/        # TypeScript interfaces
├── services/      # Database, external services
├── utils/         # Helper functions
└── locales/       # i18n translations (en.json, fr.json)
```

## Commands
```bash
npm run dev      # Development server
npm run build    # Production build
```

## Database
- Dexie.js schema v3
- Tables: sessions, events

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
