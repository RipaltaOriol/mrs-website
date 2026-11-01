import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Divider from '@/components/Divider'
import Offices from '@/components/Offices'
import PracticeAreas from '@/components/PracticeAreas'
import StructuredData from '@/components/StructuredData'
import Team from '@/components/Team'
import TreatedImage from '@/components/TreatedImage'
import { getEmployees, getPartners, getPracticeAreas, groupByDepartment } from '@/lib/content'
import { IMAGERY } from '@/lib/imagery'
import { pageMetadata } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import { PORTAL_URL } from '@/lib/portal'
import { firmGraph } from '@/lib/structured-data'
import { Suspense } from 'react'
import PrototypeSwitcher from '@/components/PrototypeSwitcher'
import { VARIANTS, VariantA, VariantB, VariantC } from './_prototype/HomeIntroVariants'

// Repeats CONTENT_REVALIDATE_SECONDS; see `lib/content/cache.ts`.
export const revalidate = 3600

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return pageMetadata('home', await pageLocale(props))
}

export default async function HomePage(props: LocaleParams & { searchParams: Promise<{ variant?: string }> }) {
  const locale = await pageLocale(props)
  const variant = (await props.searchParams).variant ?? 'current'
  const areas = getPracticeAreas(locale)
  const t = await getTranslations('home')
  const common = await getTranslations('common')
  const partners = getPartners(locale)
  const employees = await getEmployees(locale)

  return (
    <div>
      <StructuredData data={firmGraph(locale)} />
      <section aria-labelledby="hero-statement" className="mx-auto max-w-content px-5 pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="mb-5 text-sm font-medium tracking-widest text-stone uppercase">MRS Assessors</p>
        <h1 id="hero-statement" className="max-w-4xl">
          {t('heroStatement')}
        </h1>
        <p className="mt-5 mb-8 max-w-measure text-lg text-stone">{t('heroSubline')}</p>
        <a href={PORTAL_URL} className="btn">
          {common('portalAction')}
        </a>
      </section>

      <TreatedImage photograph={IMAGERY.lloretCastle} ratio="band" sizes="100vw" priority />

      {variant === 'current' && (
        <>
      <Divider />

      <section className="mx-7.5">
        <div className="mx-auto my-5 max-w-content text-start">
          <p>{t('body1')}</p>
          <p>{t('body2')}</p>
        </div>
      </section>

      <span id="work" />
      <Divider />

      <section id="content" className="mx-7.5">
        <h2 className="text-center">{t('work')}</h2>
        <div className="mx-auto my-5 max-w-content">
          <PracticeAreas areas={areas} />
        </div>
      </section>

        </>
      )}
      {variant === 'A' && <VariantA locale={locale} areas={areas} heading={t('work')} />}
      {variant === 'B' && <VariantB locale={locale} areas={areas} heading={t('work')} />}
      {variant === 'C' && <VariantC locale={locale} areas={areas} heading={t('work')} />}

      <span id="team" />
      <Divider />

      <section aria-labelledby="team-heading" className="mx-7.5">
        <h2 id="team-heading" className="text-center">
          {common('team')}
        </h2>
        <Team partners={partners} departments={groupByDepartment(employees)} />
      </section>

      <span id="contact" />
      <Divider />

      <section aria-labelledby="contact-heading" className="mx-7.5">
        <h2 id="contact-heading" className="text-center">
          {common('contact')}
        </h2>
        <Offices />
      </section>

      <Divider />
      <Suspense>
        <PrototypeSwitcher variants={[{ key: 'current', name: 'today' }, ...VARIANTS]} />
      </Suspense>
    </div>
  )
}
