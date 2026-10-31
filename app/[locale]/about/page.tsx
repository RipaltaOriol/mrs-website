import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Divider from '@/components/Divider'
import { localeAlternates } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return { alternates: localeAlternates('/about', await pageLocale(props)) }
}

// The header image came from the retired `genericImages` content type
// (ADR-0003); The Firm page's own ticket brings its imagery into `public/`.
export default async function AboutPage(props: LocaleParams) {
  await pageLocale(props)
  const t = await getTranslations('about')

  return (
    <div>
      <Divider />
      <div className="mx-7.5">
        <h2 className="text-center">La Firma</h2>
        <div className="mx-auto my-5 max-w-content">
          {(['body1', 'body2', 'body3', 'body4', 'body5'] as const).map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
          <ul className="mb-4 ps-1.5">
            {(['listItem1', 'listItem2'] as const).map((key) => (
              <li key={key} className="before:me-4 before:font-bold before:text-brand before:content-['-']">
                {t(key)}
              </li>
            ))}
          </ul>
          <p>{t('body6')}</p>
        </div>
      </div>
      <Divider />
    </div>
  )
}
