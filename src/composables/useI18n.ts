import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { i18nSettingsService } from '../services/i18n'
import type { UseI18nReturn, Locale } from '../types/i18n'

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
    locale: computed({
      get: () => locale.value as Locale,
      set: (val: Locale) => { locale.value = val }
    }),
    t,
    d,
    n,
    setLocale,
    availableLocales: availableLocales as readonly Locale[]
  }
}
