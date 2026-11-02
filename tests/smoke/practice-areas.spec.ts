import { expect, test, type APIRequestContext } from '@playwright/test'
import { getPracticeAreas } from '@/lib/content'
import { disclosures, region, visibleText as text } from './html'

const LOCALE_BY_PATH = { '/': 'ca', '/es': 'es' } as const

for (const [path, locale] of Object.entries(LOCALE_BY_PATH)) {
  test.describe(`the Practice Areas on ${path}`, () => {
    const main = async (request: APIRequestContext) =>
      region(await (await request.get(path)).text(), 'main')

    test('reads as one row per Practice Area, each with a title and a summary', async ({ request }) => {
      const rows = disclosures(await main(request))
      const areas = getPracticeAreas(locale)

      expect(rows).toHaveLength(areas.length)
      for (const [index, area] of areas.entries()) {
        expect(rows[index].label, `${area.title} title`).toContain(area.title)
        expect(rows[index].label, `${area.title} summary`).toContain(area.summary)
      }
    })

    test('opens the first row and leaves the rest collapsed', async ({ request }) => {
      const [first, ...rest] = disclosures(await main(request))

      expect(first.expanded).toBe(true)
      expect(first.hidden).toBe(false)
      expect(rest.map((row) => row.expanded)).toEqual(rest.map(() => false))
      expect(rest.map((row) => row.hidden)).toEqual(rest.map(() => true))
    })

    test('wires every trigger to the panel it controls', async ({ request }) => {
      const rows = disclosures(await main(request))
      expect(rows).toHaveLength(getPracticeAreas(locale).length)
      for (const row of rows) {
        expect(row.controls, row.label).not.toBe('')
        expect(row.panelId, row.label).toBe(row.controls)
      }
      expect(new Set(rows.map((row) => row.panelId)).size).toBe(rows.length)
    })

    test('carries the whole of every Practice Area, not a tab strip', async ({ request }) => {
      const markup = await main(request)
      const rows = disclosures(markup)

      expect(markup).not.toMatch(/role="tab(list|panel)?"/)
      for (const [index, area] of getPracticeAreas(locale).entries()) {
        const panel = text(rows[index].panel)
        for (const paragraph of area.paragraphs) expect(panel, area.title).toContain(paragraph)
        for (const item of area.items) expect(panel, area.title).toContain(item)
      }
    })

    test('holds no nested scroll container and no fixed-height box', async ({ request }) => {
      const markup = await main(request)
      const start = markup.indexOf('<section id="content"')
      expect(start, 'the Practice Areas section').toBeGreaterThan(-1)
      const section = markup.slice(start, markup.indexOf('</section>', start))

      expect(section).toContain('aria-expanded')
      expect(section).not.toMatch(/class="[^"]*\boverflow-(x-|y-)?(auto|scroll)\b/)
      expect(section).not.toMatch(/class="[^"]*\bmax-h-/)
      expect(section).not.toMatch(/class="[^"]*\bh-\d/)
    })
  })
}
