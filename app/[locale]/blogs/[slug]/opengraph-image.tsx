import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { getArticle } from '@/lib/content'
import { SOCIAL_IMAGE, socialImage } from '@/lib/social-image'

export const { alt, size, contentType } = SOCIAL_IMAGE

// Repeats CONTENT_REVALIDATE_SECONDS; see `lib/content/cache.ts`.
export const revalidate = 3600

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: requested, slug } = await params
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const [article, common] = await Promise.all([getArticle(locale, slug), getTranslations({ locale, namespace: 'common' })])
  if (!article) notFound()
  const published = article.published.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  return socialImage({ title: article.title, kicker: `${common('blog')} · ${published}` })
}
