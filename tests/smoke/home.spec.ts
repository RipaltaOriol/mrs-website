import { expect, test, type APIRequestContext } from '@playwright/test'
import { anchors, linksUnder, region, visibleText as text } from './html'

const PORTAL = 'https://app.kabiku.es/login/?next=/'

/** The opening tag and contents of the homepage's abstract band. */
function band(html: string): { frame: string; inner: string } | undefined {
  const start = html.search(/<div\b[^>]*\bdata-band\b/)
  if (start < 0) return undefined
  const open = html.indexOf('>', start) + 1
  return { frame: html.slice(start, open), inner: html.slice(open, html.indexOf('</div>', open)) }
}

for (const path of ['/', '/es']) {
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

    test('closes on an abstract band inside the same first-screen section', async ({ request }) => {
      const markup = await main(request)
      const section = markup.slice(markup.indexOf('<section'), markup.indexOf('</section>'))
      expect(section).toMatch(/^<section\b[^>]*aria-labelledby="hero-statement"[^>]*\bfirst-screen\b/)
      expect(band(section), 'no abstract band in the hero').toBeDefined()
    })

    test('sets no text over the abstract', async ({ request }) => {
      const { inner } = band(await main(request))!
      expect(inner.match(/<img\b/g)).toHaveLength(1)
      expect(text(inner)).toBe('')
    })

    test('draws the abstract from a static import with a blur placeholder, as decoration', async ({ request }) => {
      const { inner } = band(await main(request))!
      const [img = ''] = inner.match(/<img\b[^>]*>/) ?? []
      const [, src = ''] = img.match(/\bsrc="([^"]*)"/) ?? []
      expect(decodeURIComponent(src)).toMatch(/\/_next\/static\/media\/abstract-cove\.[\w-]+\.png/)
      expect(img).toMatch(/background-image:url\(&quot;data:image\/svg\+xml/)
      expect(img).toContain('alt=""')
    })
  })
}

const FIRM_BY_PATH = { '/': '/about', '/es': '/es/about' } as const

for (const [path, firm] of Object.entries(FIRM_BY_PATH)) {
  test.describe(`the homepage introduction on ${path}`, () => {
    const main = async (request: APIRequestContext) =>
      region(await (await request.get(path)).text(), 'main')

    const introduction = (markup: string) => {
      const start = markup.indexOf('<section', markup.indexOf('data-band'))
      return markup.slice(start, markup.indexOf('</section>', start))
    }

    test('is a few sentences ending in a link to The Firm', async ({ request }) => {
      const intro = introduction(await main(request))
      const prose = text(intro.slice(0, intro.lastIndexOf('<a')))
      const sentences = prose.split(/(?<=[.!?])\s+/).filter(Boolean)
      expect(sentences.length).toBeGreaterThan(0)
      expect(sentences.length).toBeLessThanOrEqual(3)
      expect(anchors(intro).map((anchor) => anchor.href)).toEqual([firm])
    })

    test('keeps the section order: introduction, Practice Areas, Team, Contact', async ({ request }) => {
      const markup = await main(request)
      const order = [
        markup.indexOf(`href="${firm}"`),
        markup.indexOf('<section id="content"'),
        markup.indexOf('aria-labelledby="team-heading"'),
        markup.indexOf('aria-labelledby="contact-heading"'),
      ]
      expect(order.every((index) => index > -1)).toBe(true)
      expect([...order].sort((a, b) => a - b)).toEqual(order)
    })
  })
}
