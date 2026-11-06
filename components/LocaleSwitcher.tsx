'use client'

import { useLocale, useTranslations } from 'next-intl'
import { counterpartPath } from '@/i18n/counterpart'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/** The footer's row of Locale links on the charcoal surface. */
export default function LocaleSwitcher() {
  const current = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')

  return (
    <div role="group" aria-label={t('locale')}>
      <ul className="flex items-center gap-2 text-sm font-medium">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={counterpartPath(pathname)}
              locale={locale}
              hrefLang={locale}
              aria-current={locale === current ? 'true' : undefined}
              className={`rounded px-1 py-1 uppercase ${locale === current ? 'text-white underline' : 'text-mist hover:text-white'}`}
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
