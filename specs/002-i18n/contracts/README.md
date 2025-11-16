# I18n Feature Contracts

**Feature**: 002-i18n
**Created**: 2025-11-16
**Purpose**: TypeScript type contracts for the internationalization feature

## Overview

This directory contains TypeScript interface definitions and type contracts that serve as the "API specification" for the i18n feature. These contracts enforce type safety and serve as documentation for implementers.

## Files

### `i18n-types.ts`
Complete TypeScript type definitions for the i18n feature including:

- **Core Types**: `Locale`, `TranslationKey`, `MessageParams`, etc.
- **Data Structures**: `LanguagePreference`, `TranslationMessage`, `PluralRule`
- **Composable APIs**: `UseI18nReturn`, `UseLocaleReturn`
- **Service Contracts**: `I18nService` interface
- **Configuration**: `I18nConfig`, `LocaleConfig`, format options
- **Component Props/Emits**: `LanguageSwitcherProps`, `LanguageSwitcherEmits`
- **Type Guards**: `isLocale()`, `isLanguagePreference()`

## Usage

### In Implementation Files

```typescript
// Import types for implementation
import type {
  Locale,
  LanguagePreference,
  UseI18nReturn,
  I18nService
} from '@/specs/002-i18n/contracts/i18n-types'

// Implement service
export class I18nServiceImpl implements I18nService {
  getPreference(): LanguagePreference | null {
    // Implementation
  }
  // ... other methods
}

// Implement composable
export function useI18n(): UseI18nReturn {
  // Implementation
}
```

### In Components

```vue
<script setup lang="ts">
import type { LanguageSwitcherProps, LanguageSwitcherEmits } from '@/specs/002-i18n/contracts/i18n-types'

const props = withDefaults(defineProps<LanguageSwitcherProps>(), {
  mode: 'dropdown',
  showNames: true,
  showFlags: false
})

const emit = defineEmits<LanguageSwitcherEmits>()
</script>
```

## Type Safety Benefits

1. **Compile-time validation**: TypeScript catches errors before runtime
2. **IDE autocomplete**: Developers get suggestions for all methods and properties
3. **Refactoring safety**: Renaming types updates all usages
4. **Documentation**: Types serve as living documentation
5. **Contract enforcement**: Ensures implementations match specifications

## Extending Contracts

When adding new features:

1. Update types in `i18n-types.ts`
2. Document new types with JSDoc comments
3. Add examples in JSDoc
4. Update this README if new files are added

### Example: Adding a New Locale

```typescript
// Update Locale type
export type Locale = 'en' | 'fr' | 'es'  // Added 'es'

// Update type guards
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && ['en', 'fr', 'es'].includes(value)
}
```

## References

- [Spec Document](../spec.md)
- [Data Model](../data-model.md)
- [Research Findings](../research.md)
