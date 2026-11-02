import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { SITE_NAME, SITE_URL } from './site'

export { SITE_NAME }

const OPEN_GRAPH_LOCALE: Record<Locale, string> = { ca: 'ca_ES', es: 'es_ES' }

/** Metadata every page inherits: the title template, site name and social card. */
export function siteMetadata(locale: Locale): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { template: `%s — ${SITE_NAME}`, default: SITE_NAME },
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, locale: OPEN_GRAPH_LOCALE[locale], type: 'website' },
    twitter: { card: 'summary_large_image' },
  }
}

/** Canonical URL and hreflang alternates for `page`, an unprefixed path such as `/about`. */
export function localeAlternates(page: string, locale: Locale): Metadata['alternates'] {
  const pathFor = (l: Locale) => getPathname({ href: page, locale: l })
  return {
    canonical: pathFor(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, pathFor(l)])),
      'x-default': pathFor(routing.defaultLocale),
    },
  }
}

/** The pages whose title and description live in the `meta` messages. */
export type MetaPage = 'home' | 'about' | 'blogs' | 'policy'

const PATH: Record<MetaPage, string> = { home: '/', about: '/about', blogs: '/blogs', policy: '/policy' }

/** Title, description, alternates and social card for a page in every Locale. */
export async function pageMetadata(page: MetaPage, locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t(`${page}.title`)
  const description = t(`${page}.description`)
  const url = getPathname({ href: PATH[page], locale })

  return {
    title: { absolute: `${title} — ${SITE_NAME}` },
    description,
    alternates: localeAlternates(PATH[page], locale),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OPEN_GRAPH_LOCALE[locale],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/** Title, description, canonical URL and social card for an Article. */
export function articleMetadata(
  article: { slug: string; title: string; preview: string | null; published: Date },
  locale: Locale,
): Metadata {
  const { title, slug, preview, published } = article
  const description = preview ?? undefined
  const canonical = getPathname({ href: `/blogs/${slug}`, locale })

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: OPEN_GRAPH_LOCALE[locale],
      type: 'article',
      publishedTime: published.toISOString(),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
