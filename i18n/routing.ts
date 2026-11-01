import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ca', 'es'],
  defaultLocale: 'ca',
  // Catalan unprefixed at `/`, Spanish under `/es`: the URL shape already indexed.
  localePrefix: 'as-needed',
  // The URL alone decides the Locale. Detecting it from headers or a cookie
  // would redirect `/` away from Catalan for Spanish-preferring browsers.
  localeDetection: false,
  localeCookie: false,
  // hreflang alternates are declared per page in the document head instead,
  // where Articles can opt out of claiming a counterpart that does not exist.
  alternateLinks: false,
})

export type Locale = (typeof routing.locales)[number]
