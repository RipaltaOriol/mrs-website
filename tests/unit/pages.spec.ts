import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { routing } from '@/i18n/routing'
import { PAGES, pageTrail, type Page } from '@/lib/pages'
import { sitemapEntries } from '@/lib/sitemap'
import { absoluteUrl } from '@/lib/site'

const LABELS: Record<string, string> = { home: 'Inici', firm: 'La Firma', blog: 'Notícies' }
const label = (key: string) => LABELS[key]

test('an inner page trails from the home page to itself under its breadcrumb label', () => {
  expect(pageTrail('about', label)).toEqual([
    { name: 'Inici', page: '/' },
    { name: 'La Firma', page: '/about' },
  ])
})

test('the home page trails to itself alone', () => {
  expect(pageTrail('home', label)).toEqual([{ name: 'Inici', page: '/' }])
})

const messages = (locale: string, namespace: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(process.cwd(), `locales/${locale}/${namespace}.json`), 'utf8'))

const pages = Object.entries(PAGES) as Array<[Page, (typeof PAGES)[Page]]>

for (const [page, { path, label, parent }] of pages) {
  test.describe(`the declared page ${page}`, () => {
    test('has a title and description in the meta messages of every Locale', () => {
      for (const locale of routing.locales) {
        expect(messages(locale, 'meta')[page], `${locale}/meta.${page}`).toMatchObject({
          title: expect.any(String),
          description: expect.any(String),
        })
      }
    })

    test('has its breadcrumb label in the common messages of every Locale', () => {
      for (const locale of routing.locales) {
        expect(messages(locale, 'common')[label], `${locale}/common.${label}`).toEqual(expect.any(String))
      }
    })

    test('is listed in the sitemap in every Locale', () => {
      const listed = sitemapEntries({ ca: [], es: [] }).map((entry) => entry.url)
      for (const locale of routing.locales) expect(listed).toContain(absoluteUrl(path, locale))
    })

    test('has a social image route', () => {
      const route = join(process.cwd(), 'app/[locale]', path, 'opengraph-image.tsx')
      expect(existsSync(route), route).toBe(true)
    })

    test('trails up through declared pages to the home page', () => {
      const seen = new Set<string>([page])
      let next: string | null = parent
      while (next) {
        expect(Object.keys(PAGES), `${page} names an undeclared parent`).toContain(next)
        expect(seen.has(next), `${page} has a cycle through ${next}`).toBe(false)
        seen.add(next)
        next = PAGES[next as Page].parent
      }
      expect([...seen].at(-1)).toBe('home')
    })
  })
}
