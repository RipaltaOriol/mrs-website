import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LongForm from '@/components/LongForm'
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
    <LongForm
      title={t('title')}
      contentsLabel={t('contents')}
      sections={SECTIONS.map((key) => ({ heading: t(key), body: t(`${key}Body`) }))}
    />
  )
}
