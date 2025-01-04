// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fi'], // List of supported locales
  defaultLocale: 'en',   // Default locale
});
