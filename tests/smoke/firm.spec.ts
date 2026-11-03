import { expect, test, type APIRequestContext } from '@playwright/test'
import { anchors, articleBody, region, sectionLabelledBy, treatedFrame, visibleText as text } from './html'

const FIRM = {
  ca: {
    path: '/about',
    lede: 'MRS Assessors es dedica des de l’any 2001',
    opening: 'MRS Assessors és, bàsicament, un equip humà',
    areas: 'Dues àrees de treball',
    contact: { href: '/#contact', text: 'Parlem' },
  },
  es: {
    path: '/es/about',
    lede: 'MRS Assessors se dedica desde el año 2001',
    opening: 'MRS Assessors es, básicamente, un equipo humano',
    areas: 'Dos áreas de trabajo',
    contact: { href: '/es#contact', text: 'Hablemos' },
  },
} as const

/** The opening tag and contents of the page's abstract band. */
function band(html: string): { frame: string; inner: string } | undefined {
  const start = html.search(/<div\b[^>]*\bdata-band\b/)
  if (start < 0) return undefined
  const open = html.indexOf('>', start) + 1
  return { frame: html.slice(start, open), inner: html.slice(open, html.indexOf('</div></div>', open)) }
}

for (const [locale, { path, lede, opening, areas, contact }] of Object.entries(FIRM)) {
  test.describe(`The Firm on ${path} (${locale})`, () => {
    const main = async (request: APIRequestContext) => region(await (await request.get(path)).text(), 'main')

    test('is titled The Firm, over the founding lede', async ({ request }) => {
      const markup = await main(request)
      const [, heading = ''] = markup.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) ?? []
      expect(text(heading)).toBe('La Firma')
      expect(text(markup.slice(markup.indexOf('</h1>'), markup.indexOf('data-band')))).toContain(lede)
    })

    test('sets its history and philosophy inside the reading column', async ({ request }) => {
      const article = articleBody(await main(request))
      expect(article?.className.split(' ')).toContain('max-w-measure')
      expect(text(article!.inner)).toContain(opening)
      expect(article!.inner.match(/<p\b/g)?.length).toBeGreaterThanOrEqual(4)
    })

    test('carries one decorative abstract between the lede and the article, and no photograph', async ({ request }) => {
      const markup = await main(request)
      const found = band(markup)
      expect(found, 'no abstract band').toBeDefined()
      expect(markup.indexOf('data-band')).toBeLessThan(markup.indexOf('<article'))
      expect(markup.match(/<img\b/g)).toHaveLength(1)
      expect(treatedFrame(markup)).toBeUndefined()
      expect(text(found!.inner)).toBe('')
    })

    test('draws the abstract from a static import with a blur placeholder', async ({ request }) => {
      const [img = ''] = band(await main(request))!.inner.match(/<img\b[^>]*>/) ?? []
      const [, src = ''] = img.match(/\bsrc="([^"]*)"/) ?? []
      expect(decodeURIComponent(src)).toMatch(/\/_next\/static\/media\/abstract-cloister\.[\w-]+\.png/)
      expect(img).toMatch(/background-image:url\(&quot;data:image\/svg\+xml/)
      expect(img).toContain('alt=""')
    })

    test('lists its two areas of work under their own heading', async ({ request }) => {
      const markup = await main(request)
      const section = sectionLabelledBy(markup, 'areas-heading')
      expect(text(section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '')).toBe(areas)
      expect(section.match(/<li\b/g)).toHaveLength(2)
    })

    test('closes on a single invitation to get in touch', async ({ request }) => {
      const markup = await main(request)
      const closing = markup.slice(markup.lastIndexOf('<section'))
      expect(anchors(closing)).toEqual([{ href: contact.href, text: contact.text, label: undefined }])
    })
  })
}
