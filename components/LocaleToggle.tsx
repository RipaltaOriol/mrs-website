'use client'

import { useLocale, useTranslations } from 'next-intl'
import { counterpartPath, ENDONYMS } from '@/i18n/counterpart'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/** The mobile menu's Locale picker: one segment per Locale, named in its own language. */
export default function LocaleToggle() {
  const current = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')

  return (
    <div role="group" aria-label={t('locale')}>
      <p className="mb-2 text-sm text-stone" aria-hidden="true">
        {t('locale')}
      </p>
      <ul className="flex rounded-full border border-mist bg-white p-1 font-medium">
        {routing.locales.map((locale) => (
          <li key={locale} className="flex-1">
            <Link
              href={counterpartPath(pathname)}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? 'true' : undefined}
              className={`block rounded-full px-4 py-2.5 text-center ${locale === current ? 'bg-ink text-white' : 'text-stone hover:text-ink'}`}
            >
              {ENDONYMS[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
