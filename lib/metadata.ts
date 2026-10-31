import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

export const SITE_URL = 'https://www.mrsassessors.com'

export const SITE_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'MRS Assessors',
  authors: [{ name: 'Oriol Ripalta' }],
  icons: { icon: '/favicon/favicon.ico' },
  openGraph: { title: 'MRS Assessors', images: '/linkedin-cover.png' },
}

/**
 * Canonical URL and hreflang alternates for a page that exists in every
 * Locale. `page` is the unprefixed path, e.g. `/about`.
 */
export function localeAlternates(page: string, locale: Locale): Metadata['alternates'] {
  const pathFor = (l: Locale) => getPathname({ href: page, locale: l })
  return {
    canonical: pathFor(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, pathFor(l)])),
      'x-default': pathFor(routing.defaultLocale),
    },
  }
}
