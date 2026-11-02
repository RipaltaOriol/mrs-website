'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

// Articles exist independently per Locale, so an Article has no counterpart
// to switch to: the switcher lands on the other Locale's Article index.
function counterpartPath(pathname: string): string {
  return pathname.startsWith('/blogs/') ? '/blogs' : pathname
}

/** The surface the switcher sits on: the light header or the charcoal footer. */
export type Tone = 'light' | 'dark'

const TONES: Record<Tone, { idle: string; current: string }> = {
  light: { idle: 'text-stone hover:text-ink', current: 'text-brand' },
  dark: { idle: 'text-mist hover:text-white', current: 'text-white underline' },
}

export default function LocaleSwitcher({ tone }: { tone: Tone }) {
  const current = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')
  const styles = TONES[tone]

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
              className={`rounded px-1 py-1 uppercase ${locale === current ? styles.current : styles.idle}`}
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
