import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { NAMESPACES } from '@/i18n/namespaces'
import { routing } from '@/i18n/routing'

const PAGES = ['home', 'about', 'blogs', 'policy']

type PageMeta = { title: string; description: string }

const meta = (locale: string): Record<string, PageMeta> =>
  JSON.parse(readFileSync(join(process.cwd(), `locales/${locale}/meta.json`), 'utf8'))

const PLACEHOLDER = /lorem|ipsum|placeholder|todo|example/i

test('the meta messages are loaded as a namespace', () => {
  expect(NAMESPACES).toContain('meta')
})

for (const locale of routing.locales) {
  test(`every page has its own title and description in ${locale}`, () => {
    const pages = meta(locale)
    expect(Object.keys(pages).sort()).toEqual([...PAGES].sort())

    const titles = PAGES.map((page) => pages[page].title)
    const descriptions = PAGES.map((page) => pages[page].description)
    expect(new Set(titles).size).toBe(PAGES.length)
    expect(new Set(descriptions).size).toBe(PAGES.length)

    for (const page of PAGES) {
      const { title, description } = pages[page]
      expect(title, `${locale}/${page}.title`).not.toMatch(PLACEHOLDER)
      expect(description, `${locale}/${page}.description`).not.toMatch(PLACEHOLDER)
      expect(description.length, `${locale}/${page}.description`).toBeGreaterThanOrEqual(70)
      expect(description.length, `${locale}/${page}.description`).toBeLessThanOrEqual(160)
    }
  })
}

test('the two Locales describe each page in their own words', () => {
  const [ca, es] = [meta('ca'), meta('es')]
  for (const page of PAGES) expect(ca[page].description).not.toBe(es[page].description)
})
