'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

// Articles exist independently per Locale, so an Article has no counterpart
// to switch to: the switcher lands on the other Locale's Article index.
function counterpartPath(pathname: string): string {
  return pathname.startsWith('/blogs/') ? '/blogs' : pathname
}

export default function LocaleSwitcher() {
  const current = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex justify-end">
      {routing.locales.map((locale) => (
        <span key={locale} className="my-5 border-r border-white px-5 last:border-r-0">
          <Link
            href={counterpartPath(pathname)}
            locale={locale}
            hrefLang={locale}
            aria-current={locale === current ? 'true' : undefined}
            className="uppercase text-white"
          >
            {locale}
          </Link>
        </span>
      ))}
    </div>
  )
}
