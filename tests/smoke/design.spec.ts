import { expect, test } from '@playwright/test'
import { articleBody, navLinks, sectionIds, stylesheets } from './html'

const POLICY = {
  ca: { path: '/policy', contents: 'Contingut', first: 'responsable-del-tractament' },
  es: { path: '/es/policy', contents: 'Contenido', first: 'responsable-del-tratamiento' },
} as const

for (const [locale, { path, contents, first }] of Object.entries(POLICY)) {
  test.describe(`${path} (${locale})`, () => {
    test('has nine sections, each with its own anchor', async ({ request }) => {
      const ids = sectionIds(await (await request.get(path)).text())
      expect(ids).toHaveLength(9)
      expect(new Set(ids).size).toBe(9)
      expect(ids[0]).toBe(first)
      for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    })

    test('lists every section in its contents navigation, in order', async ({ request }) => {
      const html = await (await request.get(path)).text()
      expect(navLinks(html, contents)).toEqual(sectionIds(html).map((id) => `#${id}`))
    })

    test('sets every section inside the reading column', async ({ request }) => {
      const article = articleBody(await (await request.get(path)).text())
      expect(article?.className.split(' ')).toContain('max-w-measure')
      expect(sectionIds(article!.inner)).toHaveLength(9)
    })
  })
}

test('every font is served from the site itself', async ({ request }) => {
  const html = await (await request.get('/policy')).text()
  expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)

  const sheets = stylesheets(html)
  expect(sheets.length).toBeGreaterThan(0)
  const fontSources: string[] = []
  for (const href of sheets) {
    const css = await (await request.get(href)).text()
    for (const [face] of css.matchAll(/@font-face\s*\{[^}]*\}/g)) {
      fontSources.push(...[...face.matchAll(/url\(([^)]+)\)/g)].map(([, url]) => url.replace(/["']/g, '')))
    }
  }
  expect(fontSources.length, 'no @font-face rules found').toBeGreaterThan(0)
  for (const url of fontSources) expect(url).toMatch(/^\/_next\/static\/media\//)
})
