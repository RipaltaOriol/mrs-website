import { PAGES } from '@/lib/pages'

/** `path` as published in the Spanish Locale. */
export const spanish = (path: string) => (path === '/' ? '/es' : `/es${path}`)

const catalan = Object.values(PAGES).map(({ path }) => path)

/** Every page published in every Locale, by Locale. */
export const PAGE_PATHS = { ca: catalan, es: catalan.map(spanish) } as const

/** Every page below the home page, in every Locale. */
export const INNER_PAGE_PATHS = Object.values(PAGES)
  .filter(({ parent }) => parent)
  .flatMap(({ path }) => [path, spanish(path)])
