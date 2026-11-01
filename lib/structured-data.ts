import { routing, type Locale } from '@/i18n/routing'
import type { Article } from './content'
import { EMAIL, TELEPHONES, telephoneHref } from './contact'
import { SITE_NAME, SITE_URL } from './site'
import { OFFICES } from './offices'

/** A schema.org JSON-LD document. */
export type JsonLd = Record<string, unknown>

const FIRM_ID = `${SITE_URL}/#firm`

const FIRM_TELEPHONES = TELEPHONES.map((telephone) => telephoneHref(telephone).replace('tel:', ''))

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const OPENING_HOURS = [
  ['09:00', '14:00'],
  ['16:00', '19:00'],
].map(([opens, closes]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: WEEKDAYS, opens, closes }))

/** An absolute URL for an unprefixed site path in `locale`. */
export function absoluteUrl(page: string, locale: Locale): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
  const path = `${prefix}${page === '/' ? '' : page}`
  return `${SITE_URL}${path}`
}

/** The firm as an Organization, and each Office as a LegalService belonging to it. */
export function firmGraph(locale: Locale): JsonLd {
  const home = absoluteUrl('/', locale)
  const firm = {
    '@type': 'Organization',
    '@id': FIRM_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    telephone: FIRM_TELEPHONES,
    email: EMAIL,
  }
  const offices = OFFICES.map((office, index) => ({
    '@type': 'LegalService',
    '@id': `${SITE_URL}/#office-${index + 1}`,
    name: office.name,
    url: home,
    image: `${SITE_URL}/logo.png`,
    parentOrganization: { '@id': FIRM_ID },
    address: {
      '@type': 'PostalAddress',
      streetAddress: office.street,
      postalCode: office.postcode,
      addressLocality: office.town,
      addressRegion: 'Girona',
      addressCountry: 'ES',
    },
    geo: { '@type': 'GeoCoordinates', latitude: office.latitude, longitude: office.longitude },
    hasMap: office.map,
    telephone: FIRM_TELEPHONES,
    email: EMAIL,
    areaServed: { '@type': 'AdministrativeArea', name: 'Girona' },
    openingHoursSpecification: OPENING_HOURS,
  }))
  return { '@context': 'https://schema.org', '@graph': [firm, ...offices] }
}

/** One step of a breadcrumb trail, by unprefixed site path. */
export type Crumb = { name: string; page: string }

/** A BreadcrumbList for `trail`, read from the home page down. */
export function breadcrumbs(trail: Crumb[], locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, page }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(page, locale),
    })),
  }
}

/** An absolute URL for a Contentful asset, which may be protocol-relative. */
function assetUrl(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url
}

/** An Article as a BlogPosting written and published by the firm. */
export function articleMarkup(
  article: Pick<Article, 'slug' | 'title' | 'published' | 'preview' | 'image'>,
  locale: Locale,
): JsonLd {
  const url = absoluteUrl(`/blogs/${article.slug}`, locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    ...(article.preview ? { description: article.preview } : {}),
    datePublished: article.published.toISOString(),
    image: assetUrl(article.image.url),
    inLanguage: locale,
    url,
    mainEntityOfPage: url,
    author: { '@id': FIRM_ID },
    publisher: { '@id': FIRM_ID },
  }
}
