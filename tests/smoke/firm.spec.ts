import { expect, test, type APIRequestContext } from '@playwright/test'
import { articleBody, region, treatedFrame, visibleText as text } from './html'

const FIRM = {
  ca: {
    path: '/about',
    opening: 'MRS Assessors es dedica des de l’any 2001',
    alt: 'Les arcades del claustre de la catedral de Girona',
  },
  es: {
    path: '/es/about',
    opening: 'MRS Assessors se dedica desde el año 2001',
    alt: 'Las arcadas del claustro de la catedral de Girona',
  },
} as const

for (const [locale, { path, opening, alt }] of Object.entries(FIRM)) {
  test.describe(`The Firm on ${path} (${locale})`, () => {
    const main = async (request: APIRequestContext) => region(await (await request.get(path)).text(), 'main')

    test('is titled The Firm', async ({ request }) => {
      const [, heading = ''] = (await main(request)).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) ?? []
      expect(text(heading)).toBe('La Firma')
    })

    test('sets its history and philosophy inside the reading column', async ({ request }) => {
      const article = articleBody(await main(request))
      expect(article?.className.split(' ')).toContain('max-w-measure')
      expect(text(article!.inner)).toContain(opening)
      expect(article!.inner.match(/<p\b/g)?.length).toBeGreaterThanOrEqual(5)
    })

    test('carries one treated photograph at a locked ratio, with no text over it', async ({ request }) => {
      const markup = await main(request)
      const found = treatedFrame(markup)
      expect(found, 'no treated image').toBeDefined()
      expect(found!.frame).toMatch(/\baspect-landscape\b/)
      expect(found!.frame).not.toMatch(/aspect-\[/)
      expect(markup.match(/<img\b/g)).toHaveLength(1)
      expect(text(found!.inner)).toBe('')
    })

    test('draws the photograph from a static import, described in its Locale', async ({ request }) => {
      const { inner } = treatedFrame(await main(request))!
      const [img = ''] = inner.match(/<img\b[^>]*>/) ?? []
      const [, src = ''] = img.match(/\bsrc="([^"]*)"/) ?? []
      expect(decodeURIComponent(src)).toMatch(/\/_next\/static\/media\/[\w-]+\.[\w-]+\.jpg/)
      expect(img).toMatch(/background-image:url\(&quot;data:image\/svg\+xml/)
      expect(img).toContain(`alt="${alt}"`)
    })
  })
}
