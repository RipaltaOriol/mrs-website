import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ArticleCard from '@/components/ArticleCard'
import Divider from '@/components/Divider'
import { getArticles } from '@/lib/content'
import { localeAlternates } from '@/lib/metadata'
import { pageLocale, type LocaleParams } from '@/lib/page'

// Repeats CONTENT_REVALIDATE_SECONDS; see `lib/content/cache.ts`.
export const revalidate = 3600

export async function generateMetadata(props: LocaleParams): Promise<Metadata> {
  return { alternates: localeAlternates('/blogs', await pageLocale(props)) }
}

export default async function ArticlesPage(props: LocaleParams) {
  const locale = await pageLocale(props)
  const common = await getTranslations('common')
  const t = await getTranslations('blog')
  const articles = await getArticles(locale)

  return (
    <div>
      <Divider />
      <div className="mx-7.5">
        <h2 className="text-center">{common('blog')}</h2>
        <div className="mx-auto my-5 grid max-w-content gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} readMore={t('readMore')} />
          ))}
        </div>
      </div>
      <Divider />
    </div>
  )
}
