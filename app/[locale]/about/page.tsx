import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import StructuredData from '@/components/StructuredData'
import { Link } from '@/i18n/navigation'
import { ABSTRACT_CLOISTER } from '@/lib/imagery'
import { pageMetadata } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import { pageTrail } from '@/lib/pages'
import { SITE_NAME } from '@/lib/site'
import { breadcrumbs } from '@/lib/structured-data'

const eyebrow = 'mb-5 text-sm font-medium tracking-widest text-stone uppercase'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return pageMetadata('about', await pageLocale(props))
}

export default async function AboutPage(props: LocaleParams) {
  const locale = await pageLocale(props)
  const t = await getTranslations('about')
  const common = await getTranslations('common')

  return (
    <div>
      <StructuredData data={breadcrumbs(pageTrail('about', common), locale)} />

      <header className="mx-auto max-w-content px-5 pt-10 pb-12 motion-safe:animate-rise md:pt-16 md:pb-16">
        <p className={eyebrow}>{SITE_NAME}</p>
        <h1 className="mb-8">{common('firm')}</h1>
        <p className="mb-0 max-w-3xl font-display text-3xl text-balance">{t('body1')}</p>
      </header>

      <div className="mx-auto max-w-content px-5">
        <div data-band className="relative h-56 overflow-hidden bg-mist md:h-80">
          <div className="absolute inset-0 motion-safe:animate-settle">
            <Image
              src={ABSTRACT_CLOISTER}
              alt=""
              placeholder="blur"
              fill
              sizes="(min-width: 75rem) 72.5rem, 100vw"
              priority
              className="object-cover object-[50%_40%]"
            />
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[1fr_2fr] md:py-24">
        <div className="md:sticky md:top-28 md:self-start">
          <p className={eyebrow}>{t('since')}</p>
          <p className="mb-0 font-display text-[clamp(4rem,10vw,8rem)] leading-none text-brand">2001</p>
          <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-rose" />
        </div>
        <article className="max-w-measure text-pretty">
          <p className="text-lg">{t('body3')}</p>
          <p>{t('body4')}</p>
          <p>{t('body2')}</p>
          <p className="mb-0">{t('body5')}</p>
        </article>
      </section>

      <section aria-labelledby="areas-heading" className="bg-mist">
        <div className="mx-auto max-w-content px-5 py-16 md:py-20">
          <h2 id="areas-heading" className="mb-10">
            {t('areasHeading')}
          </h2>
          <ol>
            {(['listItem1', 'listItem2'] as const).map((key, index) => (
              <li key={key} className="grid gap-4 border-t border-stone/40 py-8 md:grid-cols-[8rem_1fr]">
                <span aria-hidden="true" className="font-display text-4xl text-brand">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="mb-0 max-w-3xl text-lg text-pretty">{t(key)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-16 text-center md:py-24">
        <div aria-hidden="true" className="mx-auto mb-8 h-0.5 w-16 bg-rose" />
        <p className="mx-auto mb-8 max-w-measure font-display text-2xl text-balance">{t('body6')}</p>
        <Link href="/#contact" className="btn">
          {t('contactAction')}
        </Link>
      </section>
    </div>
  )
}
