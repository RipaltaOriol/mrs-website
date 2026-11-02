import { expect, test } from '@playwright/test'
import { SMOKE_WEBHOOK_SECRET } from './secret'
import {
  canonical,
  documentLanguage,
  hreflangAlternates,
  imageSources,
  linksUnder,
  localeSwitchHref,
} from './html'

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

for (const path of ['/does-not-exist', '/es/does-not-exist', '/xx/about']) {
  test(`unknown route ${path} returns 404 in a localised document`, async ({ request }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(documentLanguage(await response.text())).toBe(path.startsWith('/es/') ? 'es' : 'ca')
  })
}

const UNKNOWN_ARTICLE = {
  '/blogs/no-such-article': 'Aquesta pàgina no existeix',
  '/es/blogs/no-such-article': 'Esta página no existe',
}

for (const [path, heading] of Object.entries(UNKNOWN_ARTICLE)) {
  test(`unknown Article ${path} returns 404 carrying the site's 404`, async ({ request }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(await response.text()).toContain(heading)
  })
}

// The content-backed routes, asserted on the shape the content system feeds so
// publishing an Article never breaks them.
const ARTICLE_INDEX = { ca: '/blogs', es: '/es/blogs' } as const

for (const locale of Object.keys(ARTICLE_INDEX) as Locale[]) {
  const index = ARTICLE_INDEX[locale]

  test(`${index} lists Articles that each resolve`, async ({ request }) => {
    const html = await (await request.get(index)).text()
    const articles = linksUnder(html, `${index}/`)
    expect(articles.length, 'the Article index listed no Articles').toBeGreaterThan(0)

    for (const href of articles) {
      const article = await request.get(href, { maxRedirects: 0 })
      expect(article.status(), `${href} did not resolve`).toBe(200)
    }
  })

  test(`${index} renders each Article's thumbnail from the content system`, async ({ request }) => {
    const html = await (await request.get(index)).text()
    expect(imageSources(html).join(' ')).toContain('images.ctfassets.net')
  })

  test(`an Article under ${index} claims a canonical URL but no counterpart Locale`, async ({
    request,
  }) => {
    const indexHtml = await (await request.get(index)).text()
    const [href] = linksUnder(indexHtml, `${index}/`)
    const html = await (await request.get(href)).text()

    expect(canonical(html)).toBe(`${ORIGIN}${href}`)
    // Each Article exists independently per Locale, so it has no counterpart
    // at the same slug to point an hreflang at.
    expect(hreflangAlternates(html)).toEqual({})
  })

  test(`an Article under ${index} is not reachable under the other Locale`, async ({ request }) => {
    const indexHtml = await (await request.get(index)).text()
    const [href] = linksUnder(indexHtml, `${index}/`)
    const slug = href.split('/').pop()
    const elsewhere = locale === 'ca' ? `/es/blogs/${slug}` : `/blogs/${slug}`

    expect((await request.get(elsewhere)).status()).toBe(404)
  })
}

test('the Team section lists Employees with the Department of that Locale', async ({ request }) => {
  const catalan = await (await request.get('/')).text()
  expect(catalan).toContain('Departament Fiscal i Comptable')

  const spanish = await (await request.get('/es')).text()
  expect(spanish).toContain('Departamento Fiscal y Contable')
})

test.describe('the revalidation webhook', () => {
  const publish = { sys: { type: 'Entry', id: 'x', contentType: { sys: { id: 'mrsBlog' } } } }

  test('refuses a call that does not bear the secret', async ({ request }) => {
    const response = await request.post('/api/revalidate', { data: publish })
    expect(response.status()).toBe(401)
  })

  test('invalidates the Article tag for a publish that does', async ({ request }) => {
    const response = await request.post('/api/revalidate', {
      headers: { 'x-webhook-secret': SMOKE_WEBHOOK_SECRET },
      data: publish,
    })
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ revalidated: ['content:mrsBlog'] })
  })
})

test('no document sets a cookie or embeds a third party', async ({ request }) => {
  const index = await (await request.get('/blogs')).text()
  const [article] = linksUnder(index, '/blogs/')
  const everywhere = [...PAGES, ...Object.values(LOCALES).map((at) => at('/about')), article, '/ca/about', '/does-not-exist']

  for (const path of everywhere) {
    const response = await request.get(path, { maxRedirects: 0 })
    const headers = response.headersArray().map(({ name }) => name.toLowerCase())
    expect(headers, path).not.toContain('set-cookie')

    const html = await response.text()
    expect(html, path).not.toMatch(/<(iframe|embed|object)\b/)
    expect(html, path).not.toContain('maps/embed')
  }
})

test('the revalidation endpoint sets no cookie either', async ({ request }) => {
  const response = await request.post('/api/revalidate', { data: {} })
  expect(response.headersArray().map(({ name }) => name.toLowerCase())).not.toContain('set-cookie')
})
