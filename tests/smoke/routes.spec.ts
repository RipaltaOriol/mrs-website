import { expect, test } from '@playwright/test'
import { documentLanguage, hreflangAlternates, localeSwitchHref } from './html'

const ORIGIN = 'https://www.mrsassessors.com'

// Every page the site publishes, as its Catalan (unprefixed) path.
const PAGES = ['/', '/about', '/blogs', '/policy']

const LOCALES = {
  ca: (page: string) => page,
  es: (page: string) => (page === '/' ? '/es' : `/es${page}`),
} as const

type Locale = keyof typeof LOCALES

const other = (locale: Locale): Locale => (locale === 'ca' ? 'es' : 'ca')

for (const page of PAGES) {
  for (const locale of Object.keys(LOCALES) as Locale[]) {
    const path = LOCALES[locale](page)

    test.describe(`${path}`, () => {
      test('resolves at its published URL without redirecting', async ({ request }) => {
        const response = await request.get(path, { maxRedirects: 0 })
        expect(response.status()).toBe(200)
      })

      test(`declares document language "${locale}"`, async ({ request }) => {
        const html = await (await request.get(path)).text()
        expect(documentLanguage(html)).toBe(locale)
      })

      test('declares hreflang alternates for both Locales', async ({ request }) => {
        const html = await (await request.get(path)).text()
        const absolute = (p: string) => (p === '/' ? ORIGIN : `${ORIGIN}${p}`)
        expect(hreflangAlternates(html)).toEqual({
          ca: absolute(LOCALES.ca(page)),
          es: absolute(LOCALES.es(page)),
          'x-default': absolute(LOCALES.ca(page)),
        })
      })

      test('Locale switcher leads to the same page in the other Locale', async ({ request }) => {
        const target = other(locale)
        const html = await (await request.get(path)).text()
        const href = localeSwitchHref(html, target)
        expect(href, `no switcher link for ${target}`).toBeDefined()

        const response = await request.get(href!)
        expect(response.status()).toBe(200)
        expect(new URL(response.url()).pathname).toBe(LOCALES[target](page))
        expect(documentLanguage(await response.text())).toBe(target)
      })
    })
  }
}

test('an explicit Catalan prefix lands on the unprefixed URL', async ({ request }) => {
  const response = await request.get('/ca/about')
  expect(response.status()).toBe(200)
  expect(new URL(response.url()).pathname).toBe('/about')
})

test('Spanish-preferring visitors are not redirected away from the Catalan root', async ({
  request,
}) => {
  const response = await request.get('/', {
    headers: { 'accept-language': 'es-ES,es;q=0.9' },
    maxRedirects: 0,
  })
  expect(response.status()).toBe(200)
})

for (const path of ['/does-not-exist', '/es/does-not-exist', '/blogs/no-such-article', '/xx/about']) {
  test(`unknown route ${path} returns 404 in a localised document`, async ({ request }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(documentLanguage(await response.text())).toBe(path.startsWith('/es/') ? 'es' : 'ca')
  })
}
