import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import ArticleTags from '@/components/ArticleTags'
import PageTitle from '@/components/PageTitle'
import StructuredData from '@/components/StructuredData'
import PublishedDate from '@/components/PublishedDate'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getArticle, getArticles, type Article } from '@/lib/content'
import { articleMetadata } from '@/lib/metadata'
import { pageLocale } from '@/lib/page'
import { articleMarkup, breadcrumbs } from '@/lib/structured-data'

// Repeats CONTENT_REVALIDATE_SECONDS; see `lib/content/cache.ts`.
export const revalidate = 3600

type ArticleParams = { params: Promise<{ locale: string; slug: string }> }

/**
 * Every Article published in every Locale. Articles added after a deploy are
 * rendered on demand and cached under the same tag the webhook invalidates.
 */
export async function generateStaticParams() {
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const articles = await getArticles(locale)
      return articles.map(({ slug }) => ({ locale, slug }))
    }),
  )
  return perLocale.flat()
}

async function requestedArticle(props: ArticleParams): Promise<(Article & { locale: Locale }) | null> {
  const locale = await pageLocale(props)
  const { slug } = await props.params
  const found = await getArticle(locale, slug)
  return found && { ...found, locale }
}

export async function generateMetadata(props: ArticleParams): Promise<Metadata> {
  const found = await requestedArticle(props)
  // An absent Article is the page's 404 to declare, not metadata's: calling
  // `notFound()` from here sends Next's bare error document.
  if (!found) return {}
  return articleMetadata(found, found.locale)
}

export default async function ArticlePage(props: ArticleParams) {
  const found = await requestedArticle(props)
  if (!found) notFound()
  const { title, slug, published, tags, image, body, locale } = found
  const common = await getTranslations('common')
  const t = await getTranslations('blog')

  return (
    <div className="mx-auto max-w-content px-5 py-14 md:py-20">
      <StructuredData data={articleMarkup(found, locale)} />
      <StructuredData
        data={breadcrumbs(
          [
            { name: common('home'), page: '/' },
            { name: common('blog'), page: '/blogs' },
            { name: title, page: `/blogs/${slug}` },
          ],
          locale,
        )}
      />
      <nav aria-label={common('blog')} className="mx-auto mb-8 max-w-measure">
        <Link href="/blogs" className="text-sm text-brand underline-offset-4 hover:underline">
          <span aria-hidden="true">← </span>
          {t('backToIndex')}
        </Link>
      </nav>

      <div className="mx-auto max-w-measure">
        <PublishedDate date={published} locale={locale} className="mb-3 block" />
      </div>
      <PageTitle title={title} />

      <div className="mx-auto mb-10 max-w-measure motion-safe:animate-fade-in lg:mb-14">
        <div className="relative aspect-landscape overflow-hidden rounded bg-mist">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 42rem) 39rem, 100vw"
            priority
            className="object-cover"
          />
        </div>
      </div>

      <article className="mx-auto max-w-measure text-pretty wrap-break-word motion-safe:animate-fade-in [&_h2]:mt-10 [&_h3]:mt-8 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:ps-5">
        {documentToReactComponents(body)}
      </article>

      {tags.length > 0 && (
        <div className="mx-auto mt-12 max-w-measure border-t border-mist pt-6">
          <ArticleTags tags={tags} label={t('tags')} />
        </div>
      )}
    </div>
  )
}
