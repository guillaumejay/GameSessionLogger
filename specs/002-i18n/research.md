# Research: Internationalization (i18n) Implementation

**Feature**: 002-i18n
**Research Date**: 2025-11-16
**Status**: Complete

## Overview

This document consolidates research findings for implementing internationalization in the GameSessionLogger application, focusing on selecting the appropriate i18n library and establishing implementation patterns.

---

## Decision 1: Vue 3 i18n Library

### Decision
**Selected**: **vue-i18n v10.x** with **@intlify/unplugin-vue-i18n** for build optimization

### Rationale
1. **Official Vue ecosystem library** - Maintained by Intlify team with 1.6M+ weekly downloads
2. **Meets all requirements**:
   - ✅ Offline-first (no CDN/API dependencies)
   - ✅ Vue 3 Composition API first-class support via `useI18n()`
   - ✅ TypeScript strict mode with type-safe message schemas
   - ✅ Named placeholders (`{username}` style interpolation)
   - ✅ Built-in pluralization (pipe-separated format)
   - ✅ Native Intl API integration for date/time/number formatting
3. **Performance**: Optimizes to ~10-15 KB (gzipped) with proper configuration
4. **Battle-tested**: Industry standard with comprehensive documentation and community support
5. **Zero additional dependencies** for core functionality (uses native Intl API)

### Alternatives Considered

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **fluent-vue** | Smaller bundle (~9 KB), simpler API | Much lower adoption (2,347 vs 1.6M weekly downloads), less mature ecosystem, non-standard syntax | ❌ Rejected - adoption risk |
| **petite-vue-i18n** | Very small (5.5-9.6 KB), official subset | Missing date/time/number formatting (required), experimental status | ❌ Rejected - missing features |
| **@formatjs/vue-intl** | True ICU format support | Not Vue-specific, larger learning curve, smaller Vue community | ❌ Rejected - unnecessary complexity |

### Bundle Size Impact
- **Optimized runtime**: ~10-15 KB (gzipped)
- **English locale** (~100 keys): ~2-5 KB
- **French locale** (~100 keys): ~2-5 KB
- **Total initial load**: ~12-17 KB (well under 500 KB budget)

---

## Decision 2: Locale Formatting Strategy

### Decision
**Selected**: **Native Intl API** via vue-i18n's built-in `$d` and `$n` methods

### Rationale
1. **Zero additional dependencies** - Reduces bundle size
2. **Offline-first compatible** - No external data required
3. **Browser-native performance** - Optimized at engine level
4. **Automatic locale handling** - Switches with language automatically
5. **Sufficient for requirements** - Handles date/time/number formatting as specified

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **date-fns** | Advanced date manipulation, relative time ("2 hours ago") | Additional 13-20 KB bundle size, redundant with Intl API for basic formatting | ❌ Rejected - not needed for current requirements |
| **Day.js** | Smaller than date-fns (~7 KB), good API | Still redundant, adds complexity | ❌ Rejected - Intl API sufficient |

### Supported Formats
- **Dates**: Short (Jan 16, 2025), Long (Friday, January 16, 2025 at 2:30 PM)
- **Times**: 12h/24h formats per locale (English: 12h, French: 24h)
- **Numbers**: Currency ($1,234.56 vs 1 234,56 €), decimals, percentages
- **Locale-specific**: DD/MM/YYYY (French) vs MM/DD/YYYY (English)

---

## Decision 3: Translation File Structure

### Decision
**Selected**: **Single JSON files per locale** with hierarchical message organization

```
src/
└── locales/
    ├── en.json
    ├── fr.json
    └── index.ts
```

### Rationale
1. **Simple for 2 languages** - No module splitting needed initially
2. **Offline-first alignment** - All translations bundled
3. **Easy to maintain** - Single source of truth per language
4. **Extensible** - Can split into modules later if needed (10+ features)

### Message Organization Pattern
```json
{
  "app": { "title": "...", "description": "..." },
  "nav": { "sessions": "...", "events": "...", "settings": "..." },
  "session": { "start": "...", "end": "...", "duration": "..." },
  "event": { "add": "...", "count": "No events | One event | {count} events" },
  "validation": { "required": "...", "invalid": "..." },
  "datetime": { "formats": {...} },
  "number": { "currency": {...}, "decimal": {...} }
}
```

### Future Scalability (10+ Features)
When the project grows, split into feature-based modules:
```
src/locales/
├── en/
│   ├── common.json
│   ├── sessions.json
│   ├── events.json
│   └── settings.json
└── fr/
    └── (mirror structure)
```

---

## Decision 4: Pluralization Strategy

### Decision
**Selected**: **vue-i18n pipe-separated format** with custom French pluralization rules

### Rationale
1. **Built-in support** - No additional library needed
2. **Sufficient for English/French** - Handles all required plural cases
3. **Simple syntax** - Easy for translators to understand
4. **Customizable** - Can add language-specific rules

### Format
```json
{
  "event": {
    "count": "No events | One event | {count} events"
  }
}
```

**French pluralization rule**:
```typescript
pluralizationRules: {
  fr: (choice: number, choicesLength: number) => {
    // 0 and 1 = singular, 2+ = plural
    return (choice === 0 || choice === 1) ? 0 : 1
  }
}
```

### Alternative (ICU Message Format)
**Status**: Not needed for current requirements
- vue-i18n's format is sufficient for English/French
- ICU format would add complexity without benefit
- Can revisit if supporting languages with complex plural rules (Arabic, Polish, etc.)

---

## Decision 5: TypeScript Integration Approach

### Decision
**Selected**: **Type-safe message schema** derived from English locale

### Implementation
```typescript
// src/i18n/index.ts
import en from '../locales/en.json'

type MessageSchema = typeof en

export const i18n = createI18n<[MessageSchema], 'en' | 'fr'>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, fr }
})
```

### Benefits
1. **Autocomplete** for translation keys in IDEs
2. **Compile-time validation** - Catches typos before runtime
3. **Refactoring safety** - Rename keys with confidence
4. **Documentation** - Types serve as living documentation

---

## Decision 6: Build Optimization Strategy

### Decision
**Selected**: **Aggressive tree-shaking** with @intlify/unplugin-vue-i18n

### Vite Configuration
```typescript
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig({
  plugins: [
    VueI18nPlugin({
      include: resolve('./src/locales/**'),
      compositionOnly: true,        // Tree-shake legacy API
      fullInstall: false,            // Tree-shake unused components
      dropMessageCompiler: true,     // Tree-shake message compiler
      runtimeOnly: true,             // Use runtime-only build
    })
  ],
  define: {
    __VUE_I18N_FULL_INSTALL__: false,
    __VUE_I18N_LEGACY_API__: false,
  }
})
```

### Expected Results
- **Before optimization**: ~28 KB (gzipped)
- **After optimization**: ~10-15 KB (gzipped)
- **Bundle reduction**: ~50% savings

---

## Decision 7: Language Switching Performance

### Decision
**Selected**: **Pre-bundle both locales** for offline-first requirement

### Approach
1. Bundle both English and French in initial load (~14-22 KB total)
2. No lazy loading needed (only 2 languages, small files)
3. Locale switching is instant (reactive update, no network delay)

### Performance Targets
- **Locale switch (pre-bundled)**: <100ms ✅
- **Target requirement**: <1 second ✅
- **Margin**: 10x faster than requirement

### Alternative (Lazy Loading)
**Status**: Not needed for current requirements
- Lazy loading adds complexity
- Only saves ~2-5 KB on initial load
- Offline-first means files should be bundled anyway
- Can revisit if supporting 10+ languages

---

## Decision 8: Browser Language Detection

### Decision
**Selected**: **Navigator.language API** with fallback to English

### Implementation
```typescript
function detectBrowserLanguage(): string {
  const browserLang = navigator.language.split('-')[0] // Extract 'en' from 'en-US'
  const supportedLangs = ['en', 'fr']
  return supportedLangs.includes(browserLang) ? browserLang : 'en'
}
```

### Rationale
1. **Standard API** - Widely supported (99%+ browsers)
2. **Locale-aware** - Extracts language code from full locale (en-US → en)
3. **Safe fallback** - Defaults to English for unsupported languages
4. **User override** - Can be overridden by localStorage preference

---

## Decision 9: Translation Workflow

### Decision
**Selected**: **Machine translation with human review**

### Process
1. **Source**: English (en.json) is the master locale
2. **Machine translation**: Use Google Translate / DeepL for initial French translation
3. **Human review**: Native French speaker reviews for:
   - Accuracy and context appropriateness
   - Cultural nuances
   - Gaming terminology correctness
4. **Validation**: Automated checks for:
   - Missing keys
   - Placeholder consistency
   - Pluralization format

### Tools
- **Translation memory**: Track reviewed translations for consistency
- **Placeholder validation**: Ensure `{username}` exists in both locales
- **Coverage check**: Verify 95%+ translation coverage before deployment

---

## Implementation Checklist

### Phase 0: Setup (Completed)
- [x] Research i18n library options
- [x] Decide on vue-i18n v10.x
- [x] Define locale formatting strategy
- [x] Plan translation file structure
- [x] Document pluralization approach

### Phase 1: Basic Integration
- [ ] Install vue-i18n and @intlify/unplugin-vue-i18n
- [ ] Configure Vite with optimization flags
- [ ] Create en.json and fr.json locale files
- [ ] Set up i18n instance with Composition API mode
- [ ] Add i18n plugin to Vue app

### Phase 2: Core Implementation
- [ ] Create useI18n composable wrapper
- [ ] Convert existing UI strings to translation keys
- [ ] Implement LanguageSwitcher component
- [ ] Add localStorage persistence for locale preference
- [ ] Set up datetime and number formatting
- [ ] Implement browser language detection

### Phase 3: TypeScript Enhancement
- [ ] Add type-safe message schema
- [ ] Create typed composable wrapper
- [ ] Ensure all components use typed i18n
- [ ] Add ESLint rules for translation key patterns

### Phase 4: Translation & Testing
- [ ] Extract all English strings to en.json
- [ ] Machine translate to fr.json
- [ ] Human review of French translations
- [ ] Test all translations in context
- [ ] Verify offline functionality
- [ ] Performance test locale switching
- [ ] Accessibility test language switcher

---

## Technical Constraints & Considerations

### Bundle Size
- **Target**: <500 KB total app (gzipped)
- **i18n contribution**: ~14-22 KB (~3-4% of budget)
- **Risk**: LOW - Well within budget

### Performance
- **Target**: Language switch <1 second
- **Expected**: <100ms (10x faster)
- **Risk**: LOW - Native reactivity handles updates instantly

### Offline Support
- **Requirement**: Must work without network
- **Approach**: Bundle all translations in build
- **Risk**: LOW - No external dependencies

### Type Safety
- **Requirement**: TypeScript strict mode, no `any`
- **Approach**: Derive types from en.json
- **Risk**: LOW - vue-i18n has excellent TS support

### Extensibility
- **Requirement**: Architecture must support adding languages
- **Approach**: Hierarchical locale structure, typed locale codes
- **Risk**: LOW - Standard pattern, well-documented

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bundle size exceeds budget | Low | Medium | Aggressive tree-shaking, monitor with bundlephobia |
| Performance below target | Very Low | High | Pre-bundle locales, use Composition API |
| TypeScript type safety gaps | Low | Medium | Custom wrapper functions, strict generics |
| Translation quality issues | Medium | Medium | Human review process, native French speaker |
| Missing translations at runtime | Low | Medium | Fallback to English, automated coverage checks |

---

## Next Steps

1. ✅ **Research Complete** - This document
2. **Proceed to Phase 1**: Data model and contracts generation
3. **Update CLAUDE.md**: Add vue-i18n to technology stack
4. **Generate tasks.md**: Break down implementation into actionable tasks

---

## References

- [Vue I18n v10 Documentation](https://vue-i18n.intlify.dev/)
- [Composition API Guide](https://vue-i18n.intlify.dev/guide/advanced/composition)
- [TypeScript Support](https://vue-i18n.intlify.dev/guide/advanced/typescript)
- [Optimization Guide](https://vue-i18n.intlify.dev/guide/advanced/optimization)
- [@intlify/unplugin-vue-i18n](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n)
