import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PageTitle from '@/components/PageTitle'
import TreatedImage from '@/components/TreatedImage'
import { IMAGERY } from '@/lib/imagery'
import { localeAlternates } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return { alternates: localeAlternates('/about', await pageLocale(props)) }
}

export default async function AboutPage(props: LocaleParams) {
  await pageLocale(props)
  const t = await getTranslations('about')
  const common = await getTranslations('common')

  return (
    <div className="mx-auto max-w-content px-5 py-14 md:py-20">
      <PageTitle title={common('firm')} />

      <div className="mx-auto mb-10 max-w-measure motion-safe:animate-fade-in lg:mb-14">
        <TreatedImage
          photograph={IMAGERY.gironaCloister}
          ratio="landscape"
          sizes="(min-width: 42rem) 39rem, 100vw"
          priority
        />
      </div>

      <article className="mx-auto max-w-measure text-pretty motion-safe:animate-fade-in">
        {(['body1', 'body2', 'body3', 'body4', 'body5'] as const).map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
        <ul className="mb-4 space-y-3 ps-5">
          {(['listItem1', 'listItem2'] as const).map((key) => (
            <li key={key} className="list-disc marker:text-brand">
              {t(key)}
            </li>
          ))}
        </ul>
        <p className="mb-0">{t('body6')}</p>
      </article>
    </div>
  )
}
