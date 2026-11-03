import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import TreatedImage from '@/components/TreatedImage'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { ABSTRACT_COVE, IMAGERY } from '@/lib/imagery'
import abstractCloister from './abstract-girona-cloister.png'
import abstractOnyar from './abstract-girona-onyar.png'

/** PROTOTYPE: three layouts for La Firma, switched by `?variant=` on `/about`. */
export const VARIANTS = [
  { key: 'D1', name: 'A+B · cloister abstract band' },
  { key: 'D2', name: 'A+B · cloister abstract beside the lede' },
  { key: 'D3', name: 'A+B · small photo under 2001' },
  { key: 'D4', name: 'A+B · Onyar abstract band' },
]

const LABELS = {
  ca: {
    since: 'Des de 2001',
    beside: 'Al vostre costat des del',
    departments: 'Departaments',
    areas: 'Dues àrees de treball',
    approach: 'Client integral',
    latest: 'Darrera incorporació',
    figures: ['any de fundació', 'departaments', 'àrees de treball', 'oficines a Lloret de Mar'],
    contact: 'Parlem',
    team: "Coneix l'equip",
  },
  es: {
    since: 'Desde 2001',
    beside: 'A su lado desde',
    departments: 'Departamentos',
    areas: 'Dos áreas de trabajo',
    approach: 'Cliente integral',
    latest: 'Última incorporación',
    figures: ['año de fundación', 'departamentos', 'áreas de trabajo', 'oficinas en Lloret de Mar'],
    contact: 'Hablemos',
    team: 'Conoce al equipo',
  },
} as const

async function firmCopy(locale: Locale) {
  const t = await getTranslations('about')
  const departments = t('body2')
    .split(':')[1]!
    .replace(/ (y|i) /, ', ')
    .replace(/\.$/, '')
    .split(',')
    .map((d) => d.trim())
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
  return {
    t,
    l: LABELS[locale],
    departments,
    areas: [t('listItem1'), t('listItem2')],
  }
}

const eyebrow = 'mb-5 text-sm font-medium tracking-widest text-stone uppercase'

export async function VariantA({ locale, title }: { locale: Locale; title: string }) {
  const { t, l, departments, areas } = await firmCopy(locale)
  return (
    <div className="motion-safe:animate-fade-in">
      <header className="mx-auto max-w-content px-5 pt-10 pb-12 md:pt-16 md:pb-16">
        <p className={eyebrow}>MRS Assessors · {l.since}</p>
        <h1 className="mb-8">{title}</h1>
        <p className="max-w-3xl font-display text-3xl text-balance text-ink">{t('body1')}</p>
      </header>

      <div className="mx-auto max-w-content px-5">
        <TreatedImage photograph={IMAGERY.gironaCloister} ratio="landscape" sizes="(min-width: 75rem) 72rem, 100vw" priority />
      </div>

      <section className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[1fr_2fr] md:py-24">
        <div className="md:sticky md:top-28 md:self-start">
          <p className={eyebrow}>{l.approach}</p>
          <p className="font-display text-[clamp(4rem,10vw,8rem)] leading-none text-brand">2001</p>
          <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-rose" />
        </div>
        <article className="max-w-measure text-pretty">
          <p className="text-lg">{t('body3')}</p>
          <p>{t('body4')}</p>
          <p className="mb-0">{t('body5')}</p>
        </article>
      </section>

      <section className="mx-auto max-w-content px-5 pb-16 md:pb-24">
        <div className="grid gap-12 md:grid-cols-2">
          {areas.map((area, i) => (
            <div key={i} className="border-t-2 border-rose pt-6">
              <p className="mb-4 font-display text-4xl text-brand">0{i + 1}</p>
              <p className="mb-0 text-pretty">{area}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-mist">
        <div className="mx-auto max-w-content px-5 py-10">
          <p className={eyebrow}>{l.departments}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 font-display text-2xl">
            {departments.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <section data-surface="ink" className="bg-ink text-white">
        <div className="mx-auto max-w-content px-5 py-16 md:py-24">
          <p className="mb-5 text-sm font-medium tracking-widest text-mist uppercase">{l.latest}</p>
          <p className="mb-10 max-w-4xl font-display text-3xl text-balance">{t('body6')}</p>
          <Link href="/#contact" className="btn">
            {l.contact}
          </Link>
        </div>
      </section>
    </div>
  )
}

export async function VariantB({ locale, title }: { locale: Locale; title: string }) {
  const { t, l, departments, areas } = await firmCopy(locale)
  return (
    <div>
      <section data-surface="ink" className="bg-ink text-white">
        <div className="mx-auto grid max-w-content gap-10 px-5 pt-12 pb-14 motion-safe:animate-rise md:grid-cols-[3fr_2fr] md:items-end md:pt-20 md:pb-20">
          <div>
            <p className="mb-5 text-sm font-medium tracking-widest text-mist uppercase">{l.since}</p>
            <h1 className="mb-6">{title}</h1>
            <p className="mb-0 max-w-measure font-display text-2xl text-balance">{t('body1')}</p>
          </div>
          <ul className="border-t border-stone text-sm text-mist">
            {departments.map((d, i) => (
              <li key={d} className="flex justify-between border-b border-stone py-2">
                <span>{d}</span>
                <span className="tabular-nums">0{i + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative h-40 overflow-hidden bg-mist md:h-64">
        <Image src={ABSTRACT_COVE} alt="" placeholder="blur" fill sizes="100vw" className="object-cover" />
      </div>

      <section className="mx-auto grid max-w-content gap-12 px-5 py-16 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20 lg:py-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <TreatedImage photograph={IMAGERY.gironaCloister} ratio="landscape" sizes="(min-width: 64rem) 26rem, 100vw" priority />
        </div>
        <article className="max-w-measure text-pretty">
          <h2 className="mb-6 text-3xl text-brand">{l.approach}</h2>
          <p>{t('body3')}</p>
          <p>{t('body4')}</p>
          <p className="mb-0 font-medium">{t('body5')}</p>
        </article>
      </section>

      <section className="bg-mist">
        <div className="mx-auto max-w-content px-5 py-16 md:py-20">
          <h2 className="mb-10">{l.areas}</h2>
          <ol>
            {areas.map((area, i) => (
              <li key={i} className="grid gap-4 border-t border-stone/40 py-8 md:grid-cols-[8rem_1fr]">
                <span className="font-display text-4xl text-brand">0{i + 1}</span>
                <p className="mb-0 max-w-3xl text-lg text-pretty">{area}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-16 text-center md:py-24">
        <div aria-hidden="true" className="mx-auto mb-8 h-0.5 w-16 bg-rose" />
        <p className="mx-auto mb-8 max-w-measure font-display text-2xl text-balance">{t('body6')}</p>
        <div className="flex justify-center gap-6">
          <Link href="/#contact" className="btn">
            {l.contact}
          </Link>
          <Link href="/#team" className="self-center font-medium text-brand underline-offset-4 hover:underline">
            {l.team}
          </Link>
        </div>
      </section>
    </div>
  )
}

export async function VariantC({ locale, title }: { locale: Locale; title: string }) {
  const { t, l, departments, areas } = await firmCopy(locale)
  const figures = ['2001', String(departments.length), '2', '2']
  return (
    <div className="mx-auto max-w-content px-5 py-12 motion-safe:animate-fade-in md:py-20">
      <header className="grid gap-8 border-b border-ink pb-10 md:grid-cols-12">
        <h1 className="mb-0 md:col-span-5">{title}</h1>
        <p className="mb-0 self-end text-xl text-pretty text-stone md:col-span-6 md:col-start-7">{t('body1')}</p>
      </header>

      <dl className="grid grid-cols-2 border-b border-mist md:grid-cols-4">
        {figures.map((value, i) => (
          <div key={i} className="flex flex-col-reverse border-mist py-8 not-first:md:border-l md:px-6 md:first:ps-0 max-md:odd:border-r max-md:even:ps-6">
            <dt className="text-sm text-stone">{l.figures[i]}</dt>
            <dd className="font-display text-4xl text-brand">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <p className={eyebrow}>{l.departments}</p>
          <ol className="border-t border-mist">
            {departments.map((d, i) => (
              <li key={d} className="flex gap-4 border-b border-mist py-3">
                <span className="w-6 text-sm text-stone tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-xl">{d}</span>
              </li>
            ))}
          </ol>
        </div>
        <article className="max-w-measure text-pretty md:col-span-7 md:col-start-6">
          <p className="font-display text-2xl text-balance">{t('body3')}</p>
          <p>{t('body4')}</p>
          <p className="mb-0">{t('body5')}</p>
        </article>
      </section>

      <section className="grid gap-12 border-t border-ink py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <TreatedImage photograph={IMAGERY.gironaCloister} ratio="landscape" sizes="(min-width: 48rem) 30rem, 100vw" />
        </div>
        <div className="space-y-10 md:col-span-7">
          {areas.map((area, i) => (
            <div key={i} className="grid grid-cols-[3rem_1fr] gap-4">
              <span className="font-display text-3xl text-brand">{i + 1}.</span>
              <p className="mb-0 text-pretty">{area}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="grid gap-6 rounded bg-mist p-8 md:grid-cols-12 md:items-center md:p-12">
        <p className="mb-0 font-display text-2xl text-balance md:col-span-9">{t('body6')}</p>
        <div className="md:col-span-3 md:text-end">
          <Link href="/#contact" className="btn">
            {l.contact}
          </Link>
        </div>
      </aside>
    </div>
  )
}

type ImageOption = 'D1' | 'D2' | 'D3' | 'D4'

function AbstractBand({ src }: { src: typeof abstractCloister }) {
  return (
    <div className="relative mx-auto h-56 max-w-content overflow-hidden bg-mist motion-safe:animate-settle md:h-80">
      <Image src={src} alt="" placeholder="blur" fill sizes="(min-width: 75rem) 75rem, 100vw" priority className="object-cover object-[50%_40%]" />
    </div>
  )
}

export async function VariantD({ locale, title, image }: { locale: Locale; title: string; image: ImageOption }) {
  const { t, l, areas } = await firmCopy(locale)
  return (
    <div className="motion-safe:animate-fade-in">
      <header
        className={`mx-auto max-w-content px-5 pt-10 pb-12 md:pt-16 md:pb-16 ${image === 'D2' ? 'grid gap-10 md:grid-cols-[3fr_2fr] md:items-end' : ''}`}
      >
        <div className="motion-safe:animate-rise">
          <p className={eyebrow}>MRS Assessors</p>
          <h1 className="mb-8">{title}</h1>
          <p className="mb-0 max-w-3xl font-display text-3xl text-balance text-ink">{t('body1')}</p>
        </div>
        {image === 'D2' && (
          <div className="relative aspect-[4/5] overflow-hidden bg-mist motion-safe:animate-settle">
            <Image src={abstractCloister} alt="" placeholder="blur" fill sizes="(min-width: 48rem) 28rem, 100vw" priority className="object-cover object-[20%_50%]" />
          </div>
        )}
      </header>

      {image === 'D1' && <AbstractBand src={abstractCloister} />}
      {image === 'D4' && <AbstractBand src={abstractOnyar} />}

      <section className={`mx-auto grid max-w-content gap-10 px-5 pb-16 md:grid-cols-[1fr_2fr] md:pb-24 ${image === 'D2' || image === 'D3' ? 'pt-4' : 'pt-16 md:pt-24'}`}>
        <div className="md:sticky md:top-28 md:self-start">
          <p className={eyebrow}>{l.beside}</p>
          <p className="font-display text-[clamp(4rem,10vw,8rem)] leading-none text-brand">2001</p>
          <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-rose" />
          {image === 'D3' && (
            <div className="mt-10 max-w-80">
              <TreatedImage photograph={IMAGERY.gironaCloister} ratio="landscape" sizes="20rem" priority />
            </div>
          )}
        </div>
        <article className="max-w-measure text-pretty">
          <p className="text-lg">{t('body3')}</p>
          <p>{t('body4')}</p>
          <p className="mb-0">{t('body5')}</p>
        </article>
      </section>

      <section className="bg-mist">
        <div className="mx-auto max-w-content px-5 py-16 md:py-20">
          <h2 className="mb-10">{l.areas}</h2>
          <ol>
            {areas.map((area, i) => (
              <li key={i} className="grid gap-4 border-t border-stone/40 py-8 md:grid-cols-[8rem_1fr]">
                <span className="font-display text-4xl text-brand">0{i + 1}</span>
                <p className="mb-0 max-w-3xl text-lg text-pretty">{area}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-16 text-center md:py-24">
        <div aria-hidden="true" className="mx-auto mb-8 h-0.5 w-16 bg-rose" />
        <p className="mx-auto mb-8 max-w-measure font-display text-2xl text-balance">{t('body6')}</p>
        <div className="flex justify-center gap-6">
          <Link href="/#contact" className="btn">
            {l.contact}
          </Link>
          <Link href="/#team" className="self-center font-medium text-brand underline-offset-4 hover:underline">
            {l.team}
          </Link>
        </div>
      </section>
    </div>
  )
}
