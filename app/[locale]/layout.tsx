import type { ReactNode } from 'react'
import SiteDocument from '@/components/SiteDocument'
import { routing } from '@/i18n/routing'
import { SITE_METADATA } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import '../globals.css'

export const metadata = SITE_METADATA

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  const locale = await pageLocale({ params })
  return <SiteDocument locale={locale}>{children}</SiteDocument>
}
