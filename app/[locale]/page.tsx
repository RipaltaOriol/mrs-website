import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Divider from '@/components/Divider'
import Offices from '@/components/Offices'
import PracticeAreas from '@/components/PracticeAreas'
import StructuredData from '@/components/StructuredData'
import Team from '@/components/Team'
import TreatedImage from '@/components/TreatedImage'
import { Link } from '@/i18n/navigation'
import { getEmployees, getPartners, getPracticeAreas, groupByDepartment } from '@/lib/content'
import { IMAGERY } from '@/lib/imagery'
import { pageMetadata } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import { PORTAL_URL } from '@/lib/portal'
import { firmGraph } from '@/lib/structured-data'

// Repeats CONTENT_REVALIDATE_SECONDS; see `lib/content/cache.ts`.
export const revalidate = 3600

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return pageMetadata('home', await pageLocale(props))
}

export default async function HomePage(props: LocaleParams) {
  const locale = await pageLocale(props)
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

      <section className="mx-auto max-w-content px-5 py-14 text-center md:py-20">
        <p className="mx-auto mb-4 max-w-measure font-display text-xl text-balance">{t('intro')}</p>
        <Link href="/about" className="font-medium text-brand underline-offset-4 hover:underline">
          {t('firmLink')}
        </Link>
      </section>

      <span id="work" />
      <section id="content" aria-labelledby="work-heading" data-surface="ink" className="bg-ink py-16 text-white md:py-24">
        <div className="mx-auto max-w-content px-5">
          <h2 id="work-heading" className="mb-10 text-4xl md:mb-14">
            {t('work')}
          </h2>
          <PracticeAreas areas={getPracticeAreas(locale)} />
        </div>
      </section>

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
    </div>
  )
}
