import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LongForm from '@/components/LongForm'
import StructuredData from '@/components/StructuredData'
import { pageMetadata } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'
import { pageTrail } from '@/lib/pages'
import { breadcrumbs } from '@/lib/structured-data'

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
  return pageMetadata('policy', await pageLocale(props))
}

export default async function PolicyPage(props: LocaleParams) {
  const locale = await pageLocale(props)
  const t = await getTranslations('policy')
  const common = await getTranslations('common')

  return (
    <>
      <StructuredData
        data={breadcrumbs(pageTrail('policy', common), locale)}
      />
      <LongForm
        title={t('title')}
        contentsLabel={t('contents')}
        sections={SECTIONS.map((key) => ({ heading: t(key), body: t(`${key}Body`) }))}
      />
    </>
  )
}
