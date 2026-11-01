import type { Document } from '@contentful/rich-text-types'
import type { Locale } from '@/i18n/routing'
import caHome from '@/locales/ca/home.json'
import esHome from '@/locales/es/home.json'
import { contentful } from './contentful'
import { ContentError, requireEntries, type ContentImage, type Fields } from './decode'
import type { ContentSource } from './source'

/** Partner biographies store their lines as one string joined by `&&`. */
function splitLocaleList(value: string): string[] {
  return value
    .split('&&')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

/** A member of staff who is not a Partner, in one Locale. */
export type Employee = {
  name: string
  role: string
  department: string
  email: string
}

// Contentful suffixes its per-Locale fields `_cat` and `_es`, which is not the
// Locale code the site routes on.
const FIELD_SUFFIX: Record<Locale, string> = { ca: 'cat', es: 'es' }

function employee(fields: Fields, locale: Locale): Employee {
  const suffix = FIELD_SUFFIX[locale]
  return {
    name: fields.text('name'),
    role: fields.text(`role_${suffix}`),
    department: fields.text(`department_${suffix}`),
    email: fields.text('email'),
  }
}

export async function getEmployees(
  locale: Locale,
  source: ContentSource = contentful,
): Promise<Employee[]> {
  const entries = await requireEntries(source, 'employees')
  return entries.map((fields) => employee(fields, locale))
}

/** An Article as the index lists it, without its body. */
export type ArticleSummary = {
  slug: string
  title: string
  preview: string | null
  tags: string[]
  thumbnail: ContentImage
}

/** One published piece of commentary, in the single Locale it exists in. */
export type Article = ArticleSummary & {
  image: ContentImage
  body: Document
}

function summary(fields: Fields): ArticleSummary {
  return {
    slug: fields.text('slug'),
    title: fields.text('title'),
    preview: fields.optionalText('textPreview'),
    tags: fields.textList('tags'),
    thumbnail: fields.image('thumbnail'),
  }
}

/**
 * The Articles published in `locale`, newest first.
 *
 * Each Article exists independently per Locale, so this filters on the entry's
 * own `language` rather than asking the Delivery API for a translation. A
 * Locale with no Articles yet is an empty index, not a failure.
 */
export async function getArticles(
  locale: Locale,
  source: ContentSource = contentful,
): Promise<ArticleSummary[]> {
  const entries = await requireEntries(source, 'mrsBlog')
  return entries.filter((fields) => fields.text('language') === locale).map(summary)
}

/**
 * The Article published at `slug` in `locale`, or `null` if there is none.
 *
 * `null` is an absent Article, which the route turns into a 404. It is not a
 * broken content response: `requireEntries` has already rejected that.
 */
export async function getArticle(
  locale: Locale,
  slug: string,
  source: ContentSource = contentful,
): Promise<Article | null> {
  const entries = await requireEntries(source, 'mrsBlog')
  const found = entries.find(
    (fields) => fields.text('language') === locale && fields.text('slug') === slug,
  )
  if (!found) return null

  return {
    ...summary(found),
    image: found.image('featureImage'),
    body: found.richText('method'),
  }
}

/** A principal of the firm: two Founders and one further Partner. */
export type Partner = {
  name: string
  role: string
  biography: string[]
}

/**
 * The Partners, in the order the Team section presents them. Names are the
 * firm's three principals and do not change; the role and the biography are
 * translated, so they come from the locale file.
 */
const PARTNERS = [
  { name: 'Rafael Joaquín Ripalta Romeo', roleKey: 'founder', bioKey: 'ripaltaBio' },
  { name: 'Sebastián Martínez de Trincheria', roleKey: 'founder', bioKey: 'martinezBio' },
  { name: 'Jordi Sais Giralt', roleKey: 'partner', bioKey: 'saisBio' },
] as const

/** The `home` message keys the Partners read. */
export type PartnerMessage = (typeof PARTNERS)[number]['roleKey' | 'bioKey']

/**
 * The `home` namespace of each locale file, read directly rather than through a
 * translator: next-intl answers a missing key with the key path itself
 * (`"home.saisBio"`), which is a plausible-looking string that would render as
 * a biography. Reading the file means an absent key is absent.
 */
const HOME_MESSAGES: Record<Locale, Unchecked> = { ca: caHome, es: esHome }

/** A value read out of a locale file before the boundary has checked its shape. */
type Unchecked = Record<string, unknown>

/** A non-blank string at `path`, named by `path` when it is anything else. */
function requireText(value: unknown, path: string): string {
  if (value === undefined || value === null) {
    throw new ContentError(`home.json: ${path} is missing or empty`)
  }
  if (typeof value !== 'string') throw new ContentError(`home.json: ${path} is not text`)
  const text = value.trim()
  if (text === '') throw new ContentError(`home.json: ${path} is missing or empty`)
  return text
}

/** Every entry of a list of non-blank strings at `path`, trimmed. */
function requireLines(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) throw new ContentError(`home.json: ${path} is not a list`)
  return value.map((item, at) => {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new ContentError(`home.json: ${path} holds a blank or non-text item at position ${at}`)
    }
    return item.trim()
  })
}

function requireMessage(messages: Unchecked, key: PartnerMessage): string {
  const text = requireText(messages[key], `"${key}"`)
  // next-intl's fallback for a key it cannot resolve. Caught here too, because
  // the messages may have come through a translator rather than from the file.
  if (text === key || text.endsWith(`.${key}`)) {
    throw new ContentError(`home.json: "${key}" looks like an unresolved message key`)
  }
  return text
}

/**
 * The Partners in `locale`.
 *
 * Biographies stay in the locale JSON rather than the content system: ADR-0003
 * moved Articles and Employees in because they are edited often, and the three
 * biographies are not. They pass through the boundary all the same so that a
 * half-translated locale file fails the build with the key named, rather than
 * rendering a Partner with no biography.
 */
export function getPartners(
  locale: Locale,
  messages: Unchecked = HOME_MESSAGES[locale],
): Partner[] {
  return PARTNERS.map(({ name, roleKey, bioKey }) => ({
    name,
    role: requireMessage(messages, roleKey),
    biography: splitLocaleList(requireMessage(messages, bioKey)),
  }))
}

/** One of the nine fields of work the firm advises in, as a single Locale presents it. */
export type PracticeArea = {
  title: string
  summary: string
  paragraphs: string[]
  items: string[]
}

/** The Practice Areas in `locale`, in the order the section presents them. */
export function getPracticeAreas(
  locale: Locale,
  messages: Unchecked = HOME_MESSAGES[locale],
): PracticeArea[] {
  const areas = messages.practiceAreas
  if (!Array.isArray(areas) || areas.length === 0) {
    throw new ContentError('home.json: "practiceAreas" is missing or empty')
  }

  return areas.map((entry, index) => {
    const at = `practiceAreas[${index}]`
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new ContentError(`home.json: ${at} is not a Practice Area`)
    }

    const area = entry as Unchecked
    const items = requireLines(area.items, `${at}.items`)
    if (items.length === 0) throw new ContentError(`home.json: ${at}.items is missing or empty`)

    return {
      title: requireText(area.title, `${at}.title`),
      summary: requireText(area.summary, `${at}.summary`),
      paragraphs: requireLines(area.paragraphs, `${at}.paragraphs`),
      items,
    }
  })
}
