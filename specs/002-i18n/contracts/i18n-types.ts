/**
 * Type Contracts for Internationalization (i18n) Feature
 *
 * This file defines the TypeScript interfaces and types that serve as
 * contracts for the i18n implementation. These types enforce type safety
 * across the application and serve as documentation for the i18n API.
 *
 * @feature 002-i18n
 * @created 2025-11-16
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Supported language codes (ISO 639-1)
 * Extensible for future languages
 */
export type Locale = 'en' | 'fr'

/**
 * Translation key type
 * Should be derived from MessageSchema for type safety
 */
export type TranslationKey = string

/**
 * Parameters for message interpolation
 * Maps placeholder names to their values
 *
 * @example
 * ```typescript
 * const params: MessageParams = { username: 'Alice', count: 5 }
 * t('welcome.message', params) // "Welcome, Alice! You have 5 messages."
 * ```
 */
export type MessageParams = Record<string, string | number | boolean>

/**
 * Predefined date/time format types
 */
export type DateTimeFormat = 'short' | 'long' | 'time'

/**
 * Predefined number format types
 */
export type NumberFormat = 'currency' | 'decimal' | 'percent'

/**
 * Source of language preference
 * - browser-default: Detected from navigator.language
 * - user-selected: Explicitly chosen by user
 */
export type PreferenceSource = 'browser-default' | 'user-selected'

// ============================================================================
// Data Structures
// ============================================================================

/**
 * Centralized user settings object
 * Contains all user preferences with versioning for future migrations
 *
 * @storage localStorage key: 'user-settings'
 * @serialization JSON
 */
export interface UserSettings {
  /** Settings schema version for migrations */
  version: number

  /** Language preference settings */
  language: LanguagePreference

  // Future settings fields (to be added as needed):
  // theme?: ThemePreference
  // notifications?: NotificationPreference
  // display?: DisplayPreference
}

/**
 * Language preference settings (nested within UserSettings)
 */
export interface LanguagePreference {
  /** Selected language code */
  locale: Locale

  /** ISO 8601 timestamp of last update */
  lastUpdated: string

  /** How the locale was determined */
  source: PreferenceSource
}

/**
 * Pluralization rule for a specific choice
 */
export interface PluralRule {
  /** Numeric choice (0, 1) or 'other' for fallback */
  choice: number | 'other'

  /** Message template for this choice */
  message: string
}

/**
 * Translation message structure (internal representation)
 */
export interface TranslationMessage {
  /** Hierarchical key (e.g., 'app.title', 'session.welcome') */
  key: string

  /** Language code for this translation */
  locale: Locale

  /** Translated text (may include {placeholders}) */
  value: string

  /** List of placeholder names used in value */
  placeholders?: string[]

  /** Plural form definitions */
  pluralRules?: PluralRule[]
}

// ============================================================================
// Composable API
// ============================================================================

/**
 * Return type for useI18n composable
 * Provides core i18n functionality to components
 */
export interface UseI18nReturn {
  /** Current locale (reactive) */
  locale: Ref<Locale>

  /**
   * Translate a message key
   * @param key - Translation key (e.g., 'app.title')
   * @param params - Optional parameters for interpolation
   * @returns Translated string
   */
  t: (key: TranslationKey, params?: MessageParams) => string

  /**
   * Format a date according to locale
   * @param date - Date to format
   * @param format - Predefined format type
   * @returns Formatted date string
   */
  d: (date: Date, format?: DateTimeFormat) => string

  /**
   * Format a number according to locale
   * @param number - Number to format
   * @param format - Predefined format type
   * @returns Formatted number string
   */
  n: (number: number, format?: NumberFormat) => string

  /**
   * Change the active locale
   * @param locale - New locale to activate
   * @returns Promise that resolves when locale is changed
   */
  setLocale: (locale: Locale) => Promise<void>

  /** List of available locales */
  availableLocales: readonly Locale[]
}

/**
 * Return type for useLocale composable
 * Provides locale formatting utilities
 */
export interface UseLocaleReturn {
  /** Current locale (reactive) */
  currentLocale: Ref<Locale>

  /**
   * Format date with custom options
   * @param date - Date to format
   * @param options - Intl.DateTimeFormat options
   * @returns Formatted date string
   */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string

  /**
   * Format time with custom options
   * @param date - Date/time to format
   * @param options - Intl.DateTimeFormat options
   * @returns Formatted time string
   */
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string

  /**
   * Format number with custom options
   * @param value - Number to format
   * @param options - Intl.NumberFormat options
   * @returns Formatted number string
   */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string

  /**
   * Format currency
   * @param value - Amount to format
   * @param currency - Currency code (defaults to locale default)
   * @returns Formatted currency string
   */
  formatCurrency: (value: number, currency?: string) => string

  /**
   * Get locale-specific date format pattern
   * @returns Format pattern (e.g., 'MM/DD/YYYY' or 'DD/MM/YYYY')
   */
  getDatePattern: () => string
}

// ============================================================================
// Service Layer Contracts
// ============================================================================

/**
 * I18n service interface
 * Handles locale management and settings storage
 */
export interface I18nService {
  /**
   * Get current user settings
   * @returns User settings or null if not set
   */
  getSettings(): UserSettings | null

  /**
   * Save user settings
   * @param settings - Settings to save
   */
  saveSettings(settings: UserSettings): void

  /**
   * Get current language preference from settings
   * @returns Language preference or null if not set
   */
  getLanguagePreference(): LanguagePreference | null

  /**
   * Update language preference within settings
   * @param preference - Language preference to update
   */
  updateLanguagePreference(preference: LanguagePreference): void

  /**
   * Detect browser's preferred language
   * @returns Detected locale or 'en' as fallback
   */
  detectBrowserLanguage(): Locale

  /**
   * Get or create user settings with language preference
   * - Returns existing settings if found
   * - Detects browser language if not found
   * - Creates default settings with detected language
   * - Saves default settings
   * @returns User settings
   */
  getOrCreateSettings(): UserSettings

  /**
   * Validate if a locale is supported
   * @param locale - Locale code to validate
   * @returns True if locale is supported
   */
  isLocaleSupported(locale: string): locale is Locale

  /**
   * Clear stored settings (for testing/reset)
   */
  clearSettings(): void
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Date/time format configuration for a locale
 */
export interface LocaleDateTimeFormats {
  short: Intl.DateTimeFormatOptions
  long: Intl.DateTimeFormatOptions
  time: Intl.DateTimeFormatOptions
}

/**
 * Number format configuration for a locale
 */
export interface LocaleNumberFormats {
  currency: Intl.NumberFormatOptions
  decimal: Intl.NumberFormatOptions
  percent: Intl.NumberFormatOptions
}

/**
 * Complete locale configuration
 */
export interface LocaleConfig {
  /** Date/time format options */
  datetimeFormats: LocaleDateTimeFormats

  /** Number format options */
  numberFormats: LocaleNumberFormats

  /** Custom pluralization rules (optional) */
  pluralizationRules?: (choice: number, choicesLength: number) => number
}

/**
 * I18n instance configuration
 */
export interface I18nConfig {
  /** Default locale */
  defaultLocale: Locale

  /** Fallback locale if translation missing */
  fallbackLocale: Locale

  /** All locale configurations */
  locales: Record<Locale, LocaleConfig>

  /** Whether to use legacy API (should be false for Composition API) */
  legacy: boolean

  /** Whether to inject $t globally in templates */
  globalInjection: boolean

  /** Whether to show warnings for missing translations */
  missingWarn: boolean

  /** Whether to show warnings for fallback usage */
  fallbackWarn: boolean
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for LanguageSwitcher component
 */
export interface LanguageSwitcherProps {
  /** Display mode: 'dropdown' | 'buttons' | 'radio' */
  mode?: 'dropdown' | 'buttons' | 'radio'

  /** Show language names or codes */
  showNames?: boolean

  /** Show flags (requires flag assets) */
  showFlags?: boolean

  /** CSS class for customization */
  class?: string
}

/**
 * Emits for LanguageSwitcher component
 */
export interface LanguageSwitcherEmits {
  /** Emitted when locale changes */
  (event: 'change', locale: Locale): void

  /** Emitted when locale change fails */
  (event: 'error', error: Error): void
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type guard for Locale
 * @param value - Value to check
 * @returns True if value is a valid Locale
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (value === 'en' || value === 'fr')
}

/**
 * Type guard for LanguagePreference
 * @param value - Value to check
 * @returns True if value is a valid LanguagePreference
 */
export function isLanguagePreference(value: unknown): value is LanguagePreference {
  if (typeof value !== 'object' || value === null) return false
  const pref = value as any
  return (
    isLocale(pref.locale) &&
    typeof pref.lastUpdated === 'string' &&
    (pref.source === 'browser-default' || pref.source === 'user-selected')
  )
}

/**
 * Type guard for UserSettings
 * @param value - Value to check
 * @returns True if value is a valid UserSettings object
 */
export function isUserSettings(value: unknown): value is UserSettings {
  if (typeof value !== 'object' || value === null) return false
  const settings = value as any
  return (
    typeof settings.version === 'number' &&
    settings.version > 0 &&
    isLanguagePreference(settings.language)
  )
}

// ============================================================================
// Re-exports from vue
// ============================================================================

import type { Ref } from 'vue'
