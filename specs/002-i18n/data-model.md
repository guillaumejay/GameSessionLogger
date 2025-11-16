# Data Model: Internationalization (i18n)

**Feature**: 002-i18n
**Created**: 2025-11-16
**Status**: Draft

## Overview

This document defines the data structures, types, and relationships for the i18n feature. The data model supports language selection, translation management, locale formatting, and user preferences.

---

## Core Entities

### 1. Locale (Language Code)

**Description**: Represents a supported language in the application

**Type Definition**:
```typescript
type Locale = 'en' | 'fr'
```

**Properties**:
| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| value | `'en' \| 'fr'` | ISO 639-1 language code | Must be one of supported locales |

**Validation Rules**:
- Must be a valid ISO 639-1 two-letter code
- Must be in the supported locales list
- Case-insensitive comparison (normalize to lowercase)

**State Transitions**: N/A (immutable value type)

---

### 2. TranslationMessage

**Description**: Represents a single translation string for a specific locale

**Type Definition**:
```typescript
interface TranslationMessage {
  key: string
  locale: Locale
  value: string
  placeholders?: string[]
  pluralRules?: PluralRule[]
}
```

**Properties**:
| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| key | `string` | Unique identifier for the translation (e.g., "app.title") | Non-empty, dot-separated hierarchy |
| locale | `Locale` | Language code for this translation | Must be valid Locale |
| value | `string` | Translated text (may include placeholders like `{username}`) | Non-empty string |
| placeholders | `string[]?` | Optional list of placeholder names used in value | Each must match `{name}` pattern in value |
| pluralRules | `PluralRule[]?` | Optional plural forms (e.g., "No events \| One event \| {count} events") | Pipe-separated alternatives |

**Validation Rules**:
- `key` must follow hierarchical naming (e.g., "section.subsection.item")
- `value` placeholders must be named (not positional)
- All placeholders in `value` must be listed in `placeholders` array
- Plural rules use pipe `|` separator with optional count placeholders

**Examples**:
```typescript
// Simple translation
{
  key: "app.title",
  locale: "en",
  value: "Game Session Logger"
}

// With placeholders
{
  key: "session.welcome",
  locale: "en",
  value: "Welcome, {username}!",
  placeholders: ["username"]
}

// With pluralization
{
  key: "event.count",
  locale: "en",
  value: "No events | One event | {count} events",
  pluralRules: ["0", "1", "other"]
}
```

---

### 3. MessageSchema

**Description**: Type-safe schema for all translation keys derived from English locale

**Type Definition**:
```typescript
// Generated from en.json structure
interface MessageSchema {
  app: {
    title: string
    description: string
  }
  nav: {
    sessions: string
    events: string
    settings: string
  }
  session: {
    start: string
    end: string
    duration: string
    welcome: string
  }
  event: {
    add: string
    count: string
  }
  validation: {
    required: string
    invalid: string
  }
  // ... additional nested keys
}
```

**Purpose**: Provides TypeScript autocomplete and compile-time validation for translation keys

---

### 4. UserSettings

**Description**: Centralized user settings object containing all user preferences including language and future settings

**Type Definition**:
```typescript
interface UserSettings {
  version: number
  language: LanguagePreference
  // Future settings will be added here:
  // theme?: ThemePreference
  // notifications?: NotificationPreference
  // display?: DisplayPreference
}
```

**Properties**:
| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| version | `number` | Settings schema version for migrations | Must be positive integer |
| language | `LanguagePreference` | Language preference settings | Required, must be valid |

**Storage**:
- Stored in `localStorage` with key: `user-settings`
- Serialized as JSON string
- Persists across browser sessions
- Version field enables future schema migrations

**Validation Rules**:
- `version` must be a positive integer
- `language` must be a valid LanguagePreference object
- Future settings fields are optional

**State Transitions**:
1. **Initial Load**: Create default settings with browser-detected language
2. **User Updates Setting**: Update specific field, maintain version
3. **Schema Migration**: Increment version, transform old structure to new

**Examples**:
```typescript
// Initial default settings
{
  version: 1,
  language: {
    locale: "en",
    lastUpdated: "2025-11-16T10:30:00Z",
    source: "browser-default"
  }
}

// User-customized settings
{
  version: 1,
  language: {
    locale: "fr",
    lastUpdated: "2025-11-16T14:45:00Z",
    source: "user-selected"
  }
  // Future: theme, notifications, etc.
}
```

---

### 5. LanguagePreference

**Description**: Language preference settings (nested within UserSettings)

**Type Definition**:
```typescript
interface LanguagePreference {
  locale: Locale
  lastUpdated: string
  source: 'browser-default' | 'user-selected'
}
```

**Properties**:
| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| locale | `Locale` | Selected language code | Must be valid Locale |
| lastUpdated | `string` | ISO 8601 timestamp of last update | Must be valid ISO 8601 date string |
| source | `'browser-default' \| 'user-selected'` | How the locale was determined | Enum value |

**Validation Rules**:
- `locale` must be a supported language ('en' or 'fr')
- `lastUpdated` must be a valid ISO 8601 date string
- `source` determines if user explicitly chose vs. auto-detected

**State Transitions**:
1. **Initial Load**: `browser-default` → detected from `navigator.language`
2. **User Selection**: `browser-default` → `user-selected` (persisted)
3. **User Changes Language**: Update `locale` and `lastUpdated`, maintain `user-selected`

**Examples**:
```typescript
// Browser-detected preference
{
  locale: "en",
  lastUpdated: "2025-11-16T10:30:00Z",
  source: "browser-default"
}

// User-selected preference
{
  locale: "fr",
  lastUpdated: "2025-11-16T14:45:00Z",
  source: "user-selected"
}
```

---

### 6. DateTimeFormatOptions

**Description**: Configuration for locale-specific date and time formatting

**Type Definition**:
```typescript
interface DateTimeFormatOptions {
  locale: Locale
  format: 'short' | 'long' | 'time'
  options: Intl.DateTimeFormatOptions
}
```

**Properties**:
| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| locale | `Locale` | Language for formatting | Must be valid Locale |
| format | `'short' \| 'long' \| 'time'` | Predefined format type | Enum value |
| options | `Intl.DateTimeFormatOptions` | Native Intl.DateTimeFormat options | Valid Intl options object |

**Format Definitions**:

**English (en)**:
```typescript
{
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }, // Jan 16, 2025
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric'
  }, // Friday, January 16, 2025 at 2:30 PM
  time: {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  } // 2:30:45 PM
}
```

**French (fr)**:
```typescript
{
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }, // 16 janv. 2025
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric'
  }, // vendredi 16 janvier 2025 à 14:30
  time: {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  } // 14:30:45
}
```

---

### 7. NumberFormatOptions

**Description**: Configuration for locale-specific number formatting

**Type Definition**:
```typescript
interface NumberFormatOptions {
  locale: Locale
  format: 'currency' | 'decimal' | 'percent'
  options: Intl.NumberFormatOptions
}
```

**Properties**:
| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| locale | `Locale` | Language for formatting | Must be valid Locale |
| format | `'currency' \| 'decimal' \| 'percent'` | Predefined format type | Enum value |
| options | `Intl.NumberFormatOptions` | Native Intl.NumberFormat options | Valid Intl options object |

**Format Definitions**:

**English (en)**:
```typescript
{
  currency: {
    style: 'currency',
    currency: 'USD',
    notation: 'standard'
  }, // $1,234.56
  decimal: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }, // 1,234.56
  percent: {
    style: 'percent',
    useGrouping: false
  } // 85%
}
```

**French (fr)**:
```typescript
{
  currency: {
    style: 'currency',
    currency: 'EUR',
    notation: 'standard'
  }, // 1 234,56 €
  decimal: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }, // 1 234,56
  percent: {
    style: 'percent',
    useGrouping: false
  } // 85 %
}
```

---

## Relationships

```
┌─────────────────────┐
│   UserSettings      │
│  - version: number  │ 1
│  - language ────────┼──────┐
└─────────────────────┘      │
                             │ contains
                             ▼
                    ┌─────────────────────┐
                    │ LanguagePreference  │
                    │  - locale: Locale   │ 1
                    │  - lastUpdated      │───────┐
                    │  - source           │       │
                    └─────────────────────┘       │
                                                  │ uses
                                                  │
                    ┌─────────────────────┐       │
                    │ Locale              │◄──────┘
                    │  - value: 'en'|'fr' │ 1
                    └─────────────────────┘
                             │
                             │ determines
                             │
                             ├──────────────────┐
                             │                  │
                             ▼                  ▼
                    ┌──────────────────┐ ┌──────────────────────┐
                    │ MessageSchema    │ │ DateTimeFormatOptions │
                    │  (translations)  │ │  NumberFormatOptions  │
                    └──────────────────┘ └──────────────────────┘
                             │
                             │ typed by
                             │
                             ▼
                    ┌──────────────────┐
                    │ TranslationMessage│ *
                    │  - key: string   │
                    │  - locale        │
                    │  - value         │
                    │  - placeholders  │
                    │  - pluralRules   │
                    └──────────────────┘
```

**Cardinality**:
- 1 UserSettings object per user (stored in localStorage)
- 1 LanguagePreference within UserSettings (required field)
- 1 active Locale at a time
- Many TranslationMessages per Locale
- 1 MessageSchema (type definition)
- Multiple format options per Locale (dates, times, numbers)

**Future Extensibility**:
- UserSettings can accommodate additional preference objects (theme, notifications, etc.)
- Each preference object is a separate field in UserSettings
- Version field enables schema migrations when adding new preferences

---

## Type System

### Core Types

```typescript
// src/types/i18n.ts

/** Supported language codes */
export type Locale = 'en' | 'fr'

/** Translation key type (derived from MessageSchema) */
export type TranslationKey = keyof MessageSchema | string

/** Placeholder interpolation parameters */
export type MessageParams = Record<string, string | number>

/** Date/time format types */
export type DateTimeFormat = 'short' | 'long' | 'time'

/** Number format types */
export type NumberFormat = 'currency' | 'decimal' | 'percent'

/** Language preference source */
export type PreferenceSource = 'browser-default' | 'user-selected'

/** Pluralization rule */
export interface PluralRule {
  choice: number | 'other'
  message: string
}

/** Language preference stored in localStorage */
export interface LanguagePreference {
  locale: Locale
  lastUpdated: string // ISO 8601
  source: PreferenceSource
}

/** Translation message structure */
export interface TranslationMessage {
  key: string
  locale: Locale
  value: string
  placeholders?: string[]
  pluralRules?: PluralRule[]
}

/** i18n composable return type */
export interface UseI18nReturn {
  locale: Ref<Locale>
  t: (key: TranslationKey, params?: MessageParams) => string
  d: (date: Date, format?: DateTimeFormat) => string
  n: (number: number, format?: NumberFormat) => string
  setLocale: (locale: Locale) => Promise<void>
  availableLocales: readonly Locale[]
}
```

---

## Validation Rules Summary

### Locale Validation
- Must be one of: `'en' | 'fr'`
- Case-insensitive comparison
- Normalized to lowercase

### Translation Key Validation
- Non-empty string
- Dot-separated hierarchy (e.g., `app.title`, `session.welcome`)
- Must exist in MessageSchema for type safety

### Placeholder Validation
- Named placeholders only: `{name}` not `{0}`
- All placeholders in value must be in placeholders array
- Placeholder names must be valid identifiers (alphanumeric + underscore)

### Pluralization Validation
- Pipe-separated alternatives: `"Zero | One | Many"`
- Must have at least 2 alternatives
- Can reference count with `{count}` or `{n}`

### Date/Time Format Validation
- Format must be one of: `'short' | 'long' | 'time'`
- Options must conform to Intl.DateTimeFormatOptions

### Number Format Validation
- Format must be one of: `'currency' | 'decimal' | 'percent'`
- Options must conform to Intl.NumberFormatOptions

---

## Storage Schema

### localStorage

**Key**: `user-settings`

**Value** (JSON serialized):
```json
{
  "version": 1,
  "language": {
    "locale": "fr",
    "lastUpdated": "2025-11-16T14:45:00.000Z",
    "source": "user-selected"
  }
}
```

**Schema Version**: Currently v1
- Version 1: Initial schema with language preference
- Future versions will add theme, notifications, display preferences

**Migration Strategy**:
When adding new settings fields:
1. Increment version number
2. Add new optional fields (backward compatible)
3. Provide defaults for missing fields in older versions
4. Keep language field required for all versions

---

## Migration Considerations

### Adding New Languages

When adding a new language (e.g., Spanish):

1. Update `Locale` type: `type Locale = 'en' | 'fr' | 'es'`
2. Create new locale file: `src/locales/es.json`
3. Add datetime/number formats for `es` in i18n config
4. Update LanguageSwitcher component options
5. No data migration needed (preference persists, new locale just becomes available)

### Breaking Changes

Scenarios requiring data migration:
- **Locale code changes** (e.g., `en` → `en-US`): Migrate localStorage values
- **Translation key restructuring**: Update all components using old keys
- **Format option changes**: Update i18n configuration, may need preference reset

---

## Performance Considerations

### Memory Footprint
- **English locale**: ~2-5 KB (100 translation keys)
- **French locale**: ~2-5 KB (100 translation keys)
- **Total in-memory**: ~4-10 KB (both locales loaded)
- **Preference storage**: <1 KB (localStorage)

### Lookup Performance
- O(1) hash lookup for translation keys
- Caching of formatted dates/numbers via Intl API
- No runtime compilation (pre-compiled via @intlify/unplugin-vue-i18n)

### Switching Performance
- **Locale change**: ~10-50ms (reactive update)
- **No network delay**: Translations pre-bundled
- **State preservation**: No re-render of unchanged components

---

## Security Considerations

### XSS Prevention
- **User input**: Never interpolate raw user input into translations
- **Placeholders**: Use parameterized placeholders (`{username}`) not template literals
- **Sanitization**: All user data passed to translations should be sanitized

### Data Integrity
- **Validation**: Validate locale before storing in localStorage
- **Fallback**: Always fall back to English for missing translations
- **Type safety**: TypeScript prevents invalid keys at compile time

---

## Testing Strategy

### Unit Tests
- Validate translation key existence
- Test placeholder interpolation
- Test pluralization rules (English and French)
- Test date/time/number formatting per locale

### Integration Tests
- Language switching updates all components
- Preference persistence across sessions
- Browser language detection on first visit
- Fallback behavior for missing translations

### Type Tests
- TypeScript compilation succeeds with strict mode
- Invalid translation keys cause compile errors
- Locale type is exhaustive (all cases handled)

---

## References

- [Intl.DateTimeFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [vue-i18n Message Format](https://vue-i18n.intlify.dev/guide/essentials/syntax)
