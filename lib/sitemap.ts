import type { MetadataRoute } from 'next'
import { routing, type Locale } from '@/i18n/routing'
import { absoluteUrl } from './structured-data'

const PAGES = ['/', '/about', '/blogs', '/policy']

/** The Articles published in each Locale, as the sitemap needs them. */
export type ArticlesByLocale = Record<Locale, Array<{ slug: string; published: Date }>>

/** Every page in every Locale with its hreflang counterparts, then every Article in its own Locale. */
export function sitemapEntries(articles: ArticlesByLocale): MetadataRoute.Sitemap {
  const languages = (page: string) => ({
    ...Object.fromEntries(routing.locales.map((locale) => [locale, absoluteUrl(page, locale)])),
    'x-default': absoluteUrl(page, routing.defaultLocale),
  })

  const pages = routing.locales.flatMap((locale) =>
    PAGES.map((page) => ({ url: absoluteUrl(page, locale), alternates: { languages: languages(page) } })),
  )
  const perArticle = routing.locales.flatMap((locale) =>
    articles[locale].map(({ slug, published }) => ({
      url: absoluteUrl(`/blogs/${slug}`, locale),
      lastModified: published,
    })),
  )
  return [...pages, ...perArticle]
}
