import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n, { i18nSettingsService } from './services/i18n'

// Initialize locale from user settings
const settings = i18nSettingsService.getOrCreateSettings()
;(i18n.global.locale as any).value = settings.language.locale

const app = createApp(App)
app.use(i18n)
app.mount('#app')
