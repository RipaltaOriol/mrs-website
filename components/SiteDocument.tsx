import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import { inter, newsreader } from '@/lib/fonts'
import Footer from './Footer'
import Header from './Header'

/** The `<html>` document every page and the 404 render into. */
export default function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale} className={`${newsreader.variable} ${inter.variable}`}>
      <body>
        <NextIntlClientProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
