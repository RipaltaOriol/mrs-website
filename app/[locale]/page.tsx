import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Divider from '@/components/Divider'
import PracticeAreas, { type PracticeArea } from '@/components/PracticeAreas'
import { localeAlternates } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return { alternates: localeAlternates('/', await pageLocale(props)) }
}

type HomeT = Awaited<ReturnType<typeof getTranslations<'home'>>>

// Locale strings store lists as one string joined by `&&`.
const list = (t: HomeT, key: Parameters<HomeT>[0]) => t(key).split('&&')

function practiceAreas(t: HomeT): PracticeArea[] {
  return [
    { title: 'Laboral', paragraphs: [t('tab1Content')], items: list(t, 'tab1List') },
    {
      title: t('tab2Title'),
      paragraphs: [t('tab2Content1'), t('tab2Content2')],
      items: list(t, 'tab2List'),
    },
    {
      title: t('tab3Title'),
      paragraphs: [t('tab3Content1'), t('tab3Content2'), t('tab3Content3')],
      items: list(t, 'tab3List'),
    },
    { title: 'Mercantil', paragraphs: [t('tab4Content')], items: list(t, 'tab4List') },
    { title: t('tab5Title'), paragraphs: [t('tab5Content')], items: list(t, 'tab5List') },
    { title: t('tab6Title'), paragraphs: [t('tab6Content')], items: list(t, 'tab6List') },
    {
      title: t('tab7Title'),
      paragraphs: [t('tab7Content1'), t('tab7Content2')],
      items: list(t, 'tab7List'),
    },
    { title: t('tab8Title'), paragraphs: [], items: list(t, 'tab8List') },
    { title: t('tab9Title'), paragraphs: [], items: list(t, 'tab9List') },
  ]
}

const OFFICES = [
  {
    name: 'Sede Central Lloret de Mar',
    descriptionKey: 'office1',
    address: 'Calle Can Guidet, núm. 5 local 1A. 17310 Lloret de Mar',
    map: 'https://goo.gl/maps/CuMMNSxdEvmvxePt9',
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.6659586374553!2d2.8366444158267274!3d41.70614637923619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12bb17400ec35253%3A0x689006a99e92cb89!2sMRS%20Assessors!5e0!3m2!1sen!2ses!4v1641165940319!5m2!1sen!2ses',
  },
  {
    name: 'Oficina Lloret de Mar',
    descriptionKey: 'office2',
    address: 'Passeig Jacint Verdaguer, núm. 8. 17310 Lloret de Mar',
    map: 'https://goo.gl/maps/7QK7f6fKXKPq2Yjc8',
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.9934371028303!2d2.8462348158265196!3d41.69907737923678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12bb173097443d4d%3A0x3b897f62f299b8b8!2sPasseig%20de%20Jacint%20Verdaguer%2C%208%2C%2017310%20Lloret%20de%20Mar%2C%20Girona!5e0!3m2!1sen!2ses!4v1641166537812!5m2!1sen!2ses',
  },
] as const

const PARTNERS = [
  { name: 'Rafael Joaquín Ripalta Romeo', roleKey: 'founder', bioKey: 'ripaltaBio' },
  { name: 'Sebastián Martínez de Trincheria', roleKey: 'founder', bioKey: 'martinezBio' },
  { name: 'Jordi Sais Giralt', roleKey: 'partner', bioKey: 'saisBio' },
] as const

const buttonClass = 'inline-block rounded bg-brand px-3 py-1.5 text-white hover:bg-brand/90'

// The slider and the description image came from content types retired by
// ADR-0003, and Partner photographs leave the Team section. Employees are read
// from the content system and arrive with the typed content boundary; Partner
// biographies stay in locale JSON until they move there too (ADR-0003).
export default async function HomePage(props: LocaleParams) {
  await pageLocale(props)
  const t = await getTranslations('home')
  const common = await getTranslations('common')

  return (
    <div>
      <Divider />

      <section className="mx-7.5 text-center">
        <span className="block text-2xl font-medium text-brand">MRS ASSESSORS</span>
        <h1>{t('title')}</h1>
        <span className="block text-lg text-brand">{t('subtitle')}</span>
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
          <PracticeAreas areas={practiceAreas(t)} />
        </div>
      </section>

      <span id="team" />
      <Divider />

      <section className="mx-7.5">
        <h2 className="text-center">{common('team')}</h2>
        <div className="mx-auto mt-10 mb-5 grid max-w-content gap-x-6 md:grid-cols-2">
          {PARTNERS.map(({ name, roleKey, bioKey }) => (
            <div key={name} className="mb-12">
              <h5 className="mb-0">{name}</h5>
              <span className="text-brand">{t(roleKey)}</span>
              <ul className="mt-2.5">
                {list(t, bioKey).map((text) => (
                  <li key={text} className="border-t border-black first:border-t-0">
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <span id="contact" />
      <Divider />

      <section className="mx-7.5">
        <h2 className="text-center">{common('contact')}</h2>
        <div className="mx-auto my-5 max-w-content">
          <a href="mailto:administracio@mrsassessors.com?Subject=Consulta" className={`${buttonClass} block text-center`}>
            {t('sendEmailBtn')}
          </a>
          <hr className="my-4 border-mist" />
          <div className="grid gap-6 md:grid-cols-2">
            {OFFICES.map((office) => (
              <article key={office.name} className="mb-6 overflow-hidden rounded border border-mist bg-white">
                <iframe
                  src={office.embed}
                  title={office.name}
                  className="block h-full min-h-62.5 w-full"
                  allowFullScreen
                  loading="lazy"
                />
                <div className="p-4">
                  <h5>{office.name}</h5>
                  <p>{t(office.descriptionKey)}</p>
                  <hr className="my-4 border-mist" />
                  <p>{office.address}</p>
                  <a href={office.map} className={buttonClass}>
                    Mapa
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Divider />
    </div>
  )
}
