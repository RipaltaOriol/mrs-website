import { getLocale } from 'next-intl/server'
import NotFoundContent from '@/components/NotFoundContent'
import SiteDocument from '@/components/SiteDocument'
import { SITE_METADATA } from '@/lib/metadata'
import './globals.css'

export const metadata = SITE_METADATA

// Every URL no page claims lands here, rendered on the server with a real 404
// status. Calling `notFound()` from a dynamically rendered page would instead
// send Next's bare error document and leave the 404 to client-side rendering,
// so unknown routes are deliberately left unmatched rather than caught.
// The Locale comes from the request header the next-intl middleware sets.
export default async function NotFound() {
  const locale = await getLocale()
  return (
    <SiteDocument locale={locale}>
      <NotFoundContent />
    </SiteDocument>
  )
}
