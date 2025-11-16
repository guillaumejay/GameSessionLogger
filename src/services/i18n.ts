import { createI18n } from 'vue-i18n'
import type { Locale, UserSettings, LanguagePreference } from '../types/i18n'
import en from '../locales/en.json'
import fr from '../locales/fr.json'

// Type-safe message schema
type MessageSchema = typeof en

// Storage constants
const STORAGE_KEY = 'user-settings'
const SETTINGS_VERSION = 1

// Create i18n instance (T006)
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
    fr: (choice: number) => (choice === 0 || choice === 1) ? 0 : 1
  }
})

// UserSettings Service (T007)
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
    const browserLang = navigator.language.split('-')[0] || 'en'
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

export default i18n
