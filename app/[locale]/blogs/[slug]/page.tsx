import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Divider from '@/components/Divider'
import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { getArticle, getArticles, type Article } from '@/lib/content'
import { pageLocale } from '@/lib/page'

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
  const { title, slug, preview, locale } = found

  return {
    title,
    description: preview ?? undefined,
    // An Article exists independently per Locale (GLOSSARY: Article), so it
    // has no counterpart at this slug to declare an hreflang alternate for. It
    // claims a canonical URL and nothing else.
    alternates: { canonical: getPathname({ href: `/blogs/${slug}`, locale }) },
  }
}

export default async function ArticlePage(props: ArticleParams) {
  const found = await requestedArticle(props)
  if (!found) notFound()
  const { title, tags, image, body } = found

  return (
    <div>
      <Divider />
      <article className="mx-7.5">
        <div className="mx-auto max-w-content">
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1200px) 75rem, 100vw"
            priority
            className="h-auto w-full rounded object-cover"
          />
          <h1 className="mt-5">{title}</h1>
          {tags.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-x-4 text-sm text-brand">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          <div className="my-5">{documentToReactComponents(body)}</div>
        </div>
      </article>
      <Divider />
    </div>
  )
}
