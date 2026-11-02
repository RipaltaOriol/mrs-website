import { expect, test, type APIRequestContext } from '@playwright/test'
import { linksUnder, localeSwitchHref, region, styledBy } from './html'

const PORTAL = 'https://app.kabiku.es/login/?next=/'
const EMAIL = 'administracio@mrsassessors.com'

const ADDRESSES = [
  'Calle Can Guidet, núm. 5 local 1A. 17310 Lloret de Mar',
  'Passeig Jacint Verdaguer, núm. 8. 17310 Lloret de Mar',
]

const PAGES = ['/', '/about', '/blogs', '/policy', '/es', '/es/about', '/es/blogs', '/es/policy']

for (const path of PAGES) {
  test.describe(`the footer on ${path}`, () => {
    const footer = async (request: APIRequestContext) =>
      region(await (await request.get(path)).text(), 'footer')

    test('carries both Offices', async ({ request }) => {
      const markup = await footer(request)
      for (const address of ADDRESSES) expect(markup).toContain(address)
    })

    test('offers the email, the Portal and the privacy policy', async ({ request }) => {
      const markup = await footer(request)
      expect(linksUnder(markup, `mailto:${EMAIL}`)).not.toEqual([])
      expect(linksUnder(markup, PORTAL)).toEqual([PORTAL])
      expect(linksUnder(markup, '/policy').concat(linksUnder(markup, '/es/policy'))).not.toEqual([])
    })

    test('carries the Locale switcher', async ({ request }) => {
      const markup = await footer(request)
      for (const locale of ['ca', 'es']) {
        expect(localeSwitchHref(markup, locale), locale).toBeDefined()
      }
    })

    test('states the copyright year of the render', async ({ request }) => {
      expect(await footer(request)).toContain(String(new Date().getFullYear()))
    })
  })
}

const BRAND_RED = ['btn', 'bg-brand', 'text-brand', 'border-brand']

for (const path of PAGES) {
  test.describe(`the header on ${path}`, () => {
    const header = async (request: APIRequestContext) =>
      region(await (await request.get(path)).text(), 'header')

    test('offers one Portal control, and only one', async ({ request }) => {
      expect(linksUnder(await header(request), PORTAL)).toEqual([PORTAL])
    })

    test('sits on a light surface', async ({ request }) => {
      const html = await (await request.get(path)).text()
      const [tag] = html.match(/<header\b[^>]*>/) ?? []
      expect(tag).toContain('bg-canvas')
      expect(tag).not.toContain('bg-brand')
    })

    test('spends the brand red only on the Portal control and on active states', async ({
      request,
    }) => {
      const red = styledBy(await header(request), BRAND_RED)
      expect(red.length).toBeGreaterThan(0)
      for (const tag of red) {
        const earns = tag.href === PORTAL || tag['aria-current'] !== undefined
        expect(earns, JSON.stringify(tag)).toBe(true)
      }
    })

    test('collapses the navigation behind a labelled, closed toggle', async ({ request }) => {
      const markup = await header(request)
      const [toggle] = markup.match(/<button\b[^>]*aria-controls="site-navigation"[^>]*>/) ?? []
      expect(toggle).toBeDefined()
      expect(toggle).toContain('aria-expanded="false"')
      expect(toggle).toMatch(/aria-label="[^"]+"/)
    })
  })
}

const PROMISES_A_REDIRECT = /redirect|redirigi/i

const NOT_FOUND = [
  { path: '/does-not-exist', heading: 'Aquesta pàgina no existeix' },
  { path: '/es/does-not-exist', heading: 'Esta página no existe' },
]

for (const { path, heading } of NOT_FOUND) {
  test.describe(`the 404 at ${path}`, () => {
    test('announces itself in the Locale of the URL', async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(404)
      expect(region(await response.text(), 'main')).toContain(heading)
    })

    test('promises no redirect', async ({ request }) => {
      const body = region(await (await request.get(path)).text(), 'main')
      expect(body).not.toMatch(PROMISES_A_REDIRECT)
    })

    test('offers destinations that all resolve', async ({ request }) => {
      const body = region(await (await request.get(path)).text(), 'main')
      const destinations = linksUnder(body, '/')
      expect(destinations.length).toBeGreaterThan(1)

      for (const href of destinations) {
        const response = await request.get(href, { maxRedirects: 0 })
        expect(response.status(), href).toBe(200)
      }
    })
  })
}
