import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ArticleListItem from '@/components/ArticleListItem'
import PageTitle from '@/components/PageTitle'
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
    <div className="mx-auto max-w-content px-5 py-14 md:py-20">
      <PageTitle title={common('blog')} />
      <ol className="mx-auto max-w-measure motion-safe:animate-fade-in">
        {articles.map((article) => (
          <ArticleListItem key={article.slug} article={article} locale={locale} tagsLabel={t('tags')} />
        ))}
      </ol>
    </div>
  )
}
