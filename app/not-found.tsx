import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import NotFoundContent from '@/components/NotFoundContent'
import SiteDocument from '@/components/SiteDocument'
import { SITE_NAME, siteMetadata } from '@/lib/metadata'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('notFound')
  return { ...siteMetadata(locale), title: `${t('title')} — ${SITE_NAME}`, robots: { index: false } }
}

// The Locale comes from the request header the next-intl middleware sets.
export default async function NotFound() {
  const locale = await getLocale()
  return (
    <SiteDocument locale={locale}>
      <NotFoundContent />
    </SiteDocument>
  )
}
