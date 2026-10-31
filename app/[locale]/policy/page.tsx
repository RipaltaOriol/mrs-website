import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Divider from '@/components/Divider'
import { localeAlternates } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'

const SECTIONS = [
  'responsability',
  'data',
  'use',
  'communication',
  'update',
  'thirdParty',
  'mandatory',
  'interests',
  'underage',
] as const

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return { alternates: localeAlternates('/policy', await pageLocale(props)) }
}

export default async function PolicyPage(props: LocaleParams) {
  await pageLocale(props)
  const t = await getTranslations('policy')

  return (
    <div className="mt-20">
      <Divider />
      <div className="mx-7.5">
        <h2 className="text-center">{t('title')}</h2>
        <div className="mx-auto my-5 max-w-content">
          {SECTIONS.map((key) => (
            <section key={key}>
              <h3 className="text-brand">{t(key)}</h3>
              <p>{t(`${key}Body`)}</p>
            </section>
          ))}
        </div>
      </div>
      <Divider />
    </div>
  )
}
