import { expect, test, type APIRequestContext } from '@playwright/test'
import { linksUnder, region, treatedFrame as band, visibleText as text } from './html'

const PORTAL = 'https://app.kabiku.es/login/?next=/'

const ALT_BY_PATH = {
  '/': { alt: "La platja de Lloret de Mar amb el castell d'en Plaja sobre el penya-segat" },
  '/es': { alt: "La playa de Lloret de Mar con el castillo d'en Plaja sobre el acantilado" },
} as const

for (const [path, { alt }] of Object.entries(ALT_BY_PATH)) {
  test.describe(`the homepage hero on ${path}`, () => {
    const main = async (request: APIRequestContext) =>
      region(await (await request.get(path)).text(), 'main')

    test('opens with a statement, a subline and the Portal before any image', async ({ request }) => {
      const markup = await main(request)
      const hero = markup.slice(0, markup.indexOf('<img'))
      const [, heading] = hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) ?? []
      expect(text(heading ?? '')).not.toBe('')
      expect(text(hero.slice(hero.indexOf('</h1>')))).not.toBe('')
      expect(linksUnder(hero, PORTAL)).toEqual([PORTAL])
    })

    test('is followed by a treated band at a locked ratio', async ({ request }) => {
      const found = band(await main(request))
      expect(found, 'no treated image band').toBeDefined()
      expect(found!.frame).toMatch(/\baspect-(band|landscape)\b/)
      expect(found!.frame).not.toMatch(/aspect-\[/)
    })

    test('sets no text over the photograph', async ({ request }) => {
      const { inner } = band(await main(request))!
      expect(inner.match(/<img\b/g)).toHaveLength(1)
      expect(text(inner)).toBe('')
    })

    test('draws the photograph from a static import with a blur placeholder', async ({ request }) => {
      const { inner } = band(await main(request))!
      const [img = ''] = inner.match(/<img\b[^>]*>/) ?? []
      const [, src = ''] = img.match(/\bsrc="([^"]*)"/) ?? []
      expect(decodeURIComponent(src)).toMatch(/\/_next\/static\/media\/lloret-castle\.[\w-]+\.jpg/)
      expect(img).toMatch(/background-image:url\(&quot;data:image\/svg\+xml/)
      expect(img).toContain(`alt="${alt.replaceAll("'", '&#x27;')}"`)
    })
  })
}
