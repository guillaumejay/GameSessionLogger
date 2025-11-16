# Quick Start Guide: i18n Feature

**Feature**: 002-i18n
**Audience**: Developers implementing the i18n feature
**Estimated Time**: 1-2 hours for basic understanding

## Overview

This guide helps developers quickly understand and implement the internationalization (i18n) feature for GameSessionLogger. It covers the essential concepts, architecture, and implementation patterns.

---

## Prerequisites

Before starting implementation:

- [x] Read [spec.md](./spec.md) - Feature requirements and user stories
- [x] Read [research.md](./research.md) - Decision rationale for vue-i18n
- [x] Review [data-model.md](./data-model.md) - Data structures and types
- [ ] Familiarity with Vue 3 Composition API
- [ ] Basic understanding of TypeScript
- [ ] Knowledge of localStorage API

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │   Settings   │  │   Language   │      │
│  │  (use $t)    │  │     Menu     │  │   Switcher   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Composables Layer                         │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   useI18n()          │    │   useLocale()        │      │
│  │  - t() translate     │    │  - formatDate()      │      │
│  │  - locale ref        │    │  - formatNumber()    │      │
│  │  - setLocale()       │    │  - formatCurrency()  │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
└─────────────┼──────────────────────────┼──────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │             I18nService                           │      │
│  │  - getPreference() / savePreference()            │      │
│  │  - detectBrowserLanguage()                       │      │
│  │  - isLocaleSupported()                           │      │
│  └──────────────────┬───────────────────────────────┘      │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Storage & Data                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ localStorage│  │  en.json   │  │  fr.json   │           │
│  │ (preference)│  │(translations)│(translations)│           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Locale
A two-letter language code (`'en'` or `'fr'`) representing the active interface language.

### 2. Translation Keys
Hierarchical identifiers for translated strings:
```typescript
'app.title'             // "Game Session Logger"
'session.welcome'       // "Welcome, {username}!"
'event.count'           // "No events | One event | {count} events"
```

### 3. Placeholders
Named variables in translations that are replaced at runtime:
```typescript
t('session.welcome', { username: 'Alice' })
// "Welcome, Alice!"
```

### 4. Pluralization
Different message forms based on count:
```json
{
  "event.count": "No events | One event | {count} events"
}
```

### 5. Locale Formatting
Automatic date/time/number formatting based on language:
```typescript
d(new Date(), 'short')  // English: "Jan 16, 2025" | French: "16 janv. 2025"
n(1234.56, 'currency')  // English: "$1,234.56"   | French: "1 234,56 €"
```

---

## Implementation Phases

### Phase 1: Setup (30 minutes)

#### 1.1 Install Dependencies
```bash
npm install vue-i18n@10
npm install --save-dev @intlify/unplugin-vue-i18n
```

#### 1.2 Configure Vite
Update `vite.config.ts`:
```typescript
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      compositionOnly: true,
      fullInstall: false,
      dropMessageCompiler: true,
      runtimeOnly: true,
    })
  ],
  define: {
    __VUE_I18N_FULL_INSTALL__: false,
    __VUE_I18N_LEGACY_API__: false,
  }
})
```

#### 1.3 Create Directory Structure
```bash
mkdir src/locales
mkdir src/types
touch src/locales/en.json
touch src/locales/fr.json
touch src/types/i18n.ts
touch src/services/i18n.ts
touch src/composables/useI18n.ts
```

---

### Phase 2: Core Setup (1 hour)

#### 2.1 Define Types
Copy types from `contracts/i18n-types.ts` to `src/types/i18n.ts`

#### 2.2 Create Locale Files

**src/locales/en.json**:
```json
{
  "app": {
    "title": "Game Session Logger",
    "description": "Track your gaming sessions"
  },
  "nav": {
    "sessions": "Sessions",
    "events": "Events",
    "settings": "Settings"
  },
  "session": {
    "start": "Start Session",
    "end": "End Session",
    "duration": "Duration: {hours}h {minutes}m"
  },
  "settings": {
    "language": "Language",
    "title": "Settings"
  }
}
```

**src/locales/fr.json**:
```json
{
  "app": {
    "title": "Journal de Session de Jeu",
    "description": "Suivez vos sessions de jeu"
  },
  "nav": {
    "sessions": "Sessions",
    "events": "Événements",
    "settings": "Paramètres"
  },
  "session": {
    "start": "Démarrer la session",
    "end": "Terminer la session",
    "duration": "Durée : {hours}h {minutes}m"
  },
  "settings": {
    "language": "Langue",
    "title": "Paramètres"
  }
}
```

#### 2.3 Create I18n Instance

**src/services/i18n.ts**:
```typescript
import { createI18n } from 'vue-i18n'
import type { Locale } from '@/types/i18n'
import en from '../locales/en.json'
import fr from '../locales/fr.json'

// Type-safe message schema
type MessageSchema = typeof en

// Create i18n instance
export const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false,                    // Composition API mode
  locale: 'en',                     // Default locale
  fallbackLocale: 'en',            // Fallback if translation missing
  messages: { en, fr },
  globalInjection: true,           // Enable $t in templates
  missingWarn: false,              // Disable warnings in production
  fallbackWarn: false,
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric'
      },
      time: { hour: 'numeric', minute: 'numeric', second: 'numeric' }
    },
    fr: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric'
      },
      time: { hour: 'numeric', minute: 'numeric', second: 'numeric' }
    }
  },
  numberFormats: {
    en: {
      currency: { style: 'currency', currency: 'USD' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
      percent: { style: 'percent' }
    },
    fr: {
      currency: { style: 'currency', currency: 'EUR' },
      decimal: { style: 'decimal', minimumFractionDigits: 2 },
      percent: { style: 'percent' }
    }
  },
  pluralizationRules: {
    // French: 0 and 1 use singular, 2+ use plural
    fr: (choice, choicesLength) => (choice === 0 || choice === 1) ? 0 : 1
  }
})

export default i18n
```

#### 2.4 Add to Vue App

**src/main.ts**:
```typescript
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './services/i18n'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

---

### Phase 3: Language Preference Service (30 minutes)

**src/services/i18n.ts** (add to existing file):
```typescript
import type { UserSettings, LanguagePreference, Locale } from '@/types/i18n'

const STORAGE_KEY = 'user-settings'
const SETTINGS_VERSION = 1

export class I18nSettingsService {
  /**
   * Get stored user settings
   */
  getSettings(): UserSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      if (this.isValidSettings(parsed)) {
        return parsed
      }
      return null
    } catch (error) {
      console.error('Failed to load user settings:', error)
      return null
    }
  }

  /**
   * Save user settings
   */
  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save user settings:', error)
    }
  }

  /**
   * Get language preference from settings
   */
  getLanguagePreference(): LanguagePreference | null {
    const settings = this.getSettings()
    return settings?.language || null
  }

  /**
   * Update language preference within settings
   */
  updateLanguagePreference(preference: LanguagePreference): void {
    const settings = this.getOrCreateSettings()
    settings.language = preference
    this.saveSettings(settings)
  }

  /**
   * Detect browser's preferred language
   */
  detectBrowserLanguage(): Locale {
    const browserLang = navigator.language.split('-')[0]
    return this.isLocaleSupported(browserLang) ? browserLang : 'en'
  }

  /**
   * Get or create settings with defaults
   */
  getOrCreateSettings(): UserSettings {
    const existing = this.getSettings()
    if (existing) return existing

    const defaultSettings: UserSettings = {
      version: SETTINGS_VERSION,
      language: {
        locale: this.detectBrowserLanguage(),
        lastUpdated: new Date().toISOString(),
        source: 'browser-default'
      }
    }
    this.saveSettings(defaultSettings)
    return defaultSettings
  }

  /**
   * Validate locale is supported
   */
  isLocaleSupported(locale: string): locale is Locale {
    return locale === 'en' || locale === 'fr'
  }

  /**
   * Validate settings object
   */
  private isValidSettings(obj: any): obj is UserSettings {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.version === 'number' &&
      obj.version > 0 &&
      this.isValidLanguagePreference(obj.language)
    )
  }

  /**
   * Validate language preference object
   */
  private isValidLanguagePreference(obj: any): obj is LanguagePreference {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      this.isLocaleSupported(obj.locale) &&
      typeof obj.lastUpdated === 'string' &&
      (obj.source === 'browser-default' || obj.source === 'user-selected')
    )
  }

  /**
   * Clear stored settings (for testing)
   */
  clearSettings(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const i18nSettingsService = new I18nSettingsService()
```

---

### Phase 4: Composables (30 minutes)

**src/composables/useI18n.ts**:
```typescript
import { useI18n as useVueI18n } from 'vue-i18n'
import { i18nSettingsService } from '@/services/i18n'
import type { UseI18nReturn, Locale } from '@/types/i18n'

export function useI18n(): UseI18nReturn {
  const { t, d, n, locale, availableLocales } = useVueI18n()

  const setLocale = async (newLocale: Locale): Promise<void> => {
    locale.value = newLocale

    // Update language preference in settings
    i18nSettingsService.updateLanguagePreference({
      locale: newLocale,
      lastUpdated: new Date().toISOString(),
      source: 'user-selected'
    })
  }

  return {
    locale,
    t,
    d,
    n,
    setLocale,
    availableLocales: availableLocales as readonly Locale[]
  }
}
```

---

### Phase 5: Language Switcher Component (1 hour)

**src/components/LanguageSwitcher.vue**:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { Locale } from '@/types/i18n'

interface Props {
  mode?: 'dropdown' | 'buttons'
  showNames?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
  showNames: true
})

const { locale, setLocale } = useI18n()

const languages = [
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' }
]

const currentLanguage = computed(() =>
  languages.find(lang => lang.code === locale.value)
)

const handleChange = async (newLocale: Locale) => {
  await setLocale(newLocale)
}
</script>

<template>
  <div class="language-switcher">
    <!-- Dropdown Mode -->
    <select
      v-if="mode === 'dropdown'"
      v-model="locale"
      @change="handleChange(locale as Locale)"
      class="px-3 py-2 border rounded-lg"
    >
      <option v-for="lang in languages" :key="lang.code" :value="lang.code">
        {{ lang.flag }} {{ showNames ? lang.name : lang.code.toUpperCase() }}
      </option>
    </select>

    <!-- Button Mode -->
    <div v-else class="flex gap-2">
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="handleChange(lang.code)"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          locale === lang.code
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        {{ lang.flag }} {{ showNames ? lang.name : '' }}
      </button>
    </div>
  </div>
</template>
```

---

## Usage Examples

### In Components

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t, d, n } = useI18n()

const now = new Date()
const price = 1234.56
</script>

<template>
  <div>
    <!-- Simple translation -->
    <h1>{{ $t('app.title') }}</h1>

    <!-- With parameters -->
    <p>{{ $t('session.duration', { hours: 2, minutes: 30 }) }}</p>

    <!-- Date formatting -->
    <time>{{ $d(now, 'short') }}</time>

    <!-- Number formatting -->
    <span>{{ $n(price, 'currency') }}</span>
  </div>
</template>
```

### In Script (Composition API)

```typescript
import { useI18n } from '@/composables/useI18n'

export function useSessionMessage() {
  const { t } = useI18n()

  const getWelcomeMessage = (username: string) => {
    return t('session.welcome', { username })
  }

  return { getWelcomeMessage }
}
```

---

## Testing Checklist

- [ ] Translations load correctly for English
- [ ] Translations load correctly for French
- [ ] Language switcher updates all UI text
- [ ] Language preference persists across browser refreshes
- [ ] Browser language detection works on first visit
- [ ] Fallback to English works for missing translations
- [ ] Date formatting displays correctly for each locale
- [ ] Number formatting displays correctly for each locale
- [ ] Placeholders are interpolated correctly
- [ ] Pluralization works for 0, 1, and multiple counts

---

## Common Patterns

### Adding a New Translation
1. Add key to `en.json`
2. Add corresponding translation to `fr.json`
3. Use in component: `{{ $t('your.new.key') }}`

### Formatting Dates
```vue
<!-- Short format -->
{{ $d(date, 'short') }}

<!-- Long format with time -->
{{ $d(date, 'long') }}

<!-- Time only -->
{{ $d(date, 'time') }}
```

### Formatting Numbers
```vue
<!-- Currency -->
{{ $n(amount, 'currency') }}

<!-- Decimal -->
{{ $n(value, 'decimal') }}

<!-- Percentage -->
{{ $n(ratio, 'percent') }}
```

---

## Troubleshooting

### Translations Not Updating
- Check console for missing key warnings
- Verify key exists in both `en.json` and `fr.json`
- Clear browser cache and rebuild

### Type Errors
- Ensure TypeScript is using the correct MessageSchema type
- Run `npm run build` to verify types compile
- Check that all imports are correct

### Bundle Size Issues
- Verify Vite plugin configuration is correct
- Check feature flags are set properly
- Use build analyzer: `npm run build -- --analyze`

---

## Next Steps

1. Complete implementation using this guide
2. Extract all existing UI strings to locale files
3. Add French translations (machine translate + human review)
4. Test all user scenarios from spec.md
5. Proceed to `/speckit.tasks` for detailed task breakdown

---

## References

- [Spec Document](./spec.md)
- [Research Findings](./research.md)
- [Data Model](./data-model.md)
- [Type Contracts](./contracts/i18n-types.ts)
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/)
