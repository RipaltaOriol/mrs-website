import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return { alternates: localeAlternates('/blogs', await pageLocale(props)) }
}

// Articles are read from the content system, which moves behind the typed
// content boundary separately; until then the index renders its frame only.
export default async function ArticlesPage(props: LocaleParams) {
  await pageLocale(props)

  return (
    <div className="mx-7.5">
      <div className="mx-auto my-5 max-w-content" />
    </div>
  )
}
