<script setup lang="ts">
import { useI18n } from '../composables/useI18n'
import type { Locale } from '../types/i18n'

interface Props {
  mode?: 'dropdown' | 'buttons'
  showNames?: boolean
}

withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
  showNames: true
})

const { locale, setLocale } = useI18n()

const languages = [
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' }
]

const handleChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newLocale = target.value as Locale
  await setLocale(newLocale)
}

const handleButtonClick = async (newLocale: Locale) => {
  await setLocale(newLocale)
}
</script>

<template>
  <div class="language-switcher">
    <!-- Dropdown Mode -->
    <select
      v-if="mode === 'dropdown'"
      :value="locale"
      @change="handleChange"
      class="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600"
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
        @click="handleButtonClick(lang.code)"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          locale === lang.code
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        {{ lang.flag }} {{ showNames ? lang.name : '' }}
      </button>
    </div>
  </div>
</template>
