import { routing, type Locale } from '@/i18n/routing'

/** The production origin of the site. */
export const SITE_URL = 'https://www.mrsassessors.com'

/** The firm's name as the site presents it. */
export const SITE_NAME = 'MRS Assessors'

/** An absolute URL for an unprefixed site path in `locale`. */
export function absoluteUrl(page: string, locale: Locale): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
  const path = `${prefix}${page === '/' ? '' : page}`
  return `${SITE_URL}${path}`
}
