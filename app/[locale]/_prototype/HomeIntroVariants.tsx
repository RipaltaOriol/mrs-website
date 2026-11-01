import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import PracticeAreas from '@/components/PracticeAreas'
import type { PracticeArea } from '@/lib/content'

export const VARIANTS = [
  { key: 'A', name: 'Lead + headline section' },
  { key: 'B', name: 'Split: intro as the section standfirst' },
  { key: 'C', name: 'Full-bleed practice band' },
]

const COPY = {
  ca: {
    intro:
      "Fa més de vint anys que el grup MRS Assessors assessora empreses, particulars i administracions públiques de Lloret de Mar i Girona en matèria jurídica, fiscal, comptable, laboral, immobiliària i d'assegurances. Treballem amb un concepte de client integral: una gestió global i propera, amb tots els departaments coordinats.",
    link: 'Coneix la Firma',
  },
  es: {
    intro:
      'Desde hace más de veinte años, el grupo MRS Assessors asesora a empresas, particulares y administraciones públicas de Lloret de Mar y Girona en materia jurídica, fiscal, contable, laboral, inmobiliaria y de seguros. Trabajamos bajo un concepto de cliente integral: una gestión global y cercana, con todos los departamentos coordinados.',
    link: 'Conoce la Firma',
  },
} satisfies Record<Locale, { intro: string; link: string }>

type Props = { locale: Locale; areas: PracticeArea[]; heading: string }

function FirmLink({ locale, className = '' }: { locale: Locale; className?: string }) {
  return (
    <Link href="/about" className={`font-medium text-brand underline-offset-4 hover:underline ${className}`}>
      {COPY[locale].link} →
    </Link>
  )
}

export function VariantA({ locale, areas, heading }: Props) {
  return (
    <>
      <section className="mx-auto max-w-content px-5 pt-10 pb-4">
        <p className="mb-2 max-w-measure text-stone">{COPY[locale].intro}</p>
        <FirmLink locale={locale} className="text-sm" />
      </section>

      <span id="work" />
      <section id="content" className="mx-auto max-w-content px-5 pt-16 pb-20">
        <h2 className="mb-10 text-4xl md:mb-14">{heading}</h2>
        <div className="[&_.font-display]:text-2xl">
          <PracticeAreas areas={areas} />
        </div>
      </section>
    </>
  )
}

export function VariantB({ locale, areas, heading }: Props) {
  return (
    <>
      <span id="work" />
      <section id="content" className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:py-24">
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="mb-6 text-4xl">{heading}</h2>
          <p className="mb-3 text-sm text-stone">{COPY[locale].intro}</p>
          <FirmLink locale={locale} className="text-sm" />
        </div>
        <PracticeAreas areas={areas} />
      </section>
    </>
  )
}

export function VariantC({ locale, areas, heading }: Props) {
  return (
    <>
      <section className="mx-auto max-w-content px-5 py-14 text-center md:py-20">
        <p className="mx-auto mb-4 max-w-2xl font-display text-xl text-balance">{COPY[locale].intro}</p>
        <FirmLink locale={locale} />
      </section>

      <span id="work" />
      <section
        id="content"
        className="bg-ink py-16 text-canvas md:py-24 [&_.border-mist]:border-stone [&_.text-brand]:text-rose [&_.text-stone]:text-mist [&_button:hover]:text-rose"
      >
        <div className="mx-auto max-w-content px-5">
          <p className="mb-3 text-sm font-medium tracking-widest text-rose uppercase">MRS Assessors</p>
          <h2 className="mb-10 text-4xl md:mb-14">{heading}</h2>
          <div className="[&_.font-display]:text-2xl">
            <PracticeAreas areas={areas} />
          </div>
        </div>
      </section>
    </>
  )
}
