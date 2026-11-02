import { getTranslations } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import type { Page } from './pages'
import { SITE_NAME } from './site'
import { socialImage } from './social-image'

/** The social preview image for a page, titled from its `meta` messages. */
export async function pageSocialImage(page: Page, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const known = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  const t = await getTranslations({ locale: known, namespace: 'meta' })
  return socialImage({ title: t(`${page}.title`), kicker: SITE_NAME })
}
