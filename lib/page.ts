import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, type Locale } from '@/i18n/routing'

export type LocaleParams = { params: Promise<{ locale: string }> }

/** Resolves the route's Locale and enables static rendering for it. */
export async function pageLocale({ params }: LocaleParams): Promise<Locale> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return locale
}
