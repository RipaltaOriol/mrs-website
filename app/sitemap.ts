import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getArticles } from '@/lib/content'
import { sitemapEntries, type ArticlesByLocale } from '@/lib/sitemap'

// Repeats CONTENT_REVALIDATE_SECONDS; see `lib/content/cache.ts`.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const perLocale = await Promise.all(routing.locales.map(async (locale) => [locale, await getArticles(locale)]))
  return sitemapEntries(Object.fromEntries(perLocale) as ArticlesByLocale)
}
