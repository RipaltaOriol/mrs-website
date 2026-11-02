import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import SiteDocument from '@/components/SiteDocument'
import { routing } from '@/i18n/routing'
import { siteMetadata } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import '../globals.css'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return siteMetadata(await pageLocale(props))
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleParams & { children: ReactNode }) {
  const locale = await pageLocale({ params })
  return <SiteDocument locale={locale}>{children}</SiteDocument>
}
