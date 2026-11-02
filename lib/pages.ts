import type { Crumb } from './structured-data'

type PageEntry = { path: string; label: string; parent: string | null }

/** The pages published in every Locale, keyed by their `meta` messages; `label` is a `common` message key. */
export const PAGES = {
  home: { path: '/', label: 'home', parent: null },
  about: { path: '/about', label: 'firm', parent: 'home' },
  blogs: { path: '/blogs', label: 'blog', parent: 'home' },
  policy: { path: '/policy', label: 'privacyPolicy', parent: 'home' },
} as const satisfies Record<string, PageEntry>

/** A page published in every Locale. */
export type Page = keyof typeof PAGES

type PageLabel = (typeof PAGES)[Page]['label']

/** The breadcrumb trail from the home page down to `page`, named by `label`. */
export function pageTrail(page: Page, label: (key: PageLabel) => string): Crumb[] {
  const { path, label: key, parent } = PAGES[page] as PageEntry
  const crumb = { name: label(key as PageLabel), page: path }
  return parent ? [...pageTrail(parent as Page, label), crumb] : [crumb]
}
