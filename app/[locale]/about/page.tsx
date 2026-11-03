import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PageTitle from '@/components/PageTitle'
import StructuredData from '@/components/StructuredData'
import TreatedImage from '@/components/TreatedImage'
import { IMAGERY } from '@/lib/imagery'
import { pageMetadata } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import { pageTrail } from '@/lib/pages'
import { breadcrumbs } from '@/lib/structured-data'
import { Suspense } from 'react'
import PrototypeSwitcher from '@/components/PrototypeSwitcher'
import { VARIANTS, VariantA, VariantB, VariantC } from './_prototype/FirmVariants'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return pageMetadata('about', await pageLocale(props))
}

export default async function AboutPage(props: LocaleParams & { searchParams: Promise<{ variant?: string }> }) {
  const locale = await pageLocale(props)
  const variant = (await props.searchParams).variant ?? 'current'
  const t = await getTranslations('about')
  const common = await getTranslations('common')

  const switcher = (
    <Suspense>
      <PrototypeSwitcher variants={[{ key: 'current', name: 'today' }, ...VARIANTS]} />
    </Suspense>
  )
  const crumbs = <StructuredData data={breadcrumbs(pageTrail('about', common), locale)} />
  const Variant = { A: VariantA, B: VariantB, C: VariantC }[variant]
  if (Variant)
    return (
      <>
        {crumbs}
        <Variant locale={locale} title={common('firm')} />
        {switcher}
      </>
    )

  return (
    <div className="mx-auto max-w-content px-5 py-14 md:py-20">
      {switcher}
      <StructuredData
        data={breadcrumbs(pageTrail('about', common), locale)}
      />
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
