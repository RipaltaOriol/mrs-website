import { expect, test, type APIRequestContext } from '@playwright/test'
import {
  canonical,
  documentTitle,
  linkHrefs,
  linksUnder,
  metaContent,
  region,
  structuredData,
  visibleText,
} from './html'

const ORIGIN = 'https://www.mrsassessors.com'

const PAGES = {
  ca: ['/', '/about', '/blogs', '/policy'],
  es: ['/es', '/es/about', '/es/blogs', '/es/policy'],
} as const

const PLACEHOLDER = /linkedin-cover|lorem|ipsum|placeholder|example\.com|localhost|Oriol/i

/** The site-relative path of an absolute production URL. */
const local = (url: string) => {
  expect(url.startsWith(ORIGIN), `${url} is not on ${ORIGIN}`).toBe(true)
  return url.slice(ORIGIN.length) || '/'
}

async function expectImage(request: APIRequestContext, url: string) {
  const response = await request.get(local(url), { maxRedirects: 0 })
  expect(response.status(), url).toBe(200)
  expect(response.headers()['content-type'], url).toBe('image/png')
}

const nodesOf = (html: string, type: string) =>
  structuredData(html).flatMap((doc) => (Array.isArray(doc['@graph']) ? doc['@graph'] : [doc])).filter(
    (node) => node['@type'] === type,
  )

for (const [locale, paths] of Object.entries(PAGES)) {
  test(`every ${locale} page has its own title and description`, async ({ request }) => {
    const heads = await Promise.all(paths.map(async (path) => (await request.get(path)).text()))
    const titles = heads.map(documentTitle)
    const descriptions = heads.map((html) => metaContent(html, 'description'))

    expect(new Set(titles).size).toBe(paths.length)
    expect(new Set(descriptions).size).toBe(paths.length)
    for (const title of titles) expect(title).toMatch(/ — MRS Assessors$/)
    for (const description of descriptions) expect(description?.length).toBeGreaterThan(50)
  })

  for (const path of paths) {
    test(`${path} carries a social card with its own preview image`, async ({ request }) => {
      const html = await (await request.get(path)).text()

      expect(metaContent(html, 'og:title')).toBe(documentTitle(html)?.replace(' — MRS Assessors', ''))
      expect(metaContent(html, 'og:description')).toBe(metaContent(html, 'description'))
      expect(metaContent(html, 'og:url')).toBe(canonical(html))
      expect(metaContent(html, 'og:site_name')).toBe('MRS Assessors')
      expect(metaContent(html, 'og:locale')).toBe(locale === 'ca' ? 'ca_ES' : 'es_ES')
      expect(metaContent(html, 'twitter:card')).toBe('summary_large_image')

      const image = metaContent(html, 'og:image')!
      expect(metaContent(html, 'twitter:image')).toBe(image)
      await expectImage(request, image)

      const social = [...html.matchAll(/<meta (?:property|name)="(?:og|twitter):[^>]*>/g)].join('\n')
      expect(social).not.toMatch(PLACEHOLDER)
    })
  }
}

test('the home page publishes the firm as a LegalService at both Offices', async ({ request }) => {
  for (const path of ['/', '/es']) {
    const offices = nodesOf(await (await request.get(path)).text(), 'LegalService')
    expect(offices.map((office) => (office.address as Record<string, string>).streetAddress)).toEqual([
      'Calle Can Guidet, núm. 5 local 1A',
      'Passeig Jacint Verdaguer, núm. 8',
    ])
    for (const office of offices) {
      expect(office).toMatchObject({
        telephone: ['+34972371821', '+34972372240'],
        geo: { '@type': 'GeoCoordinates' },
        areaServed: expect.anything(),
      })
      expect(office.openingHoursSpecification).toEqual([
        expect.objectContaining({ opens: '09:00', closes: '14:00' }),
        expect.objectContaining({ opens: '16:00', closes: '19:00' }),
      ])
    }
  }
})

for (const path of ['/about', '/blogs', '/policy', '/es/about', '/es/blogs', '/es/policy']) {
  test(`${path} carries breadcrumbs from the home page to itself`, async ({ request }) => {
    const html = await (await request.get(path)).text()
    const [trail] = nodesOf(html, 'BreadcrumbList')
    const items = trail.itemListElement as Array<{ item: string }>

    expect(items[0].item).toBe(path.startsWith('/es') ? `${ORIGIN}/es` : ORIGIN)
    expect(items.at(-1)!.item).toBe(canonical(html))
  })
}

for (const index of ['/blogs', '/es/blogs']) {
  test(`an Article under ${index} is marked up and previewed under its own title`, async ({ request }) => {
    const [href] = linksUnder(await (await request.get(index)).text(), `${index}/`)
    const html = await (await request.get(href)).text()
    const heading = visibleText(region(html, 'main').match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)![1])

    const [article] = nodesOf(html, 'BlogPosting')
    expect(article).toMatchObject({ headline: heading, url: canonical(html), inLanguage: index === '/blogs' ? 'ca' : 'es' })
    expect(Date.parse(article.datePublished as string)).not.toBeNaN()
    expect(nodesOf(html, 'BreadcrumbList')).toHaveLength(1)

    expect(metaContent(html, 'og:type')).toBe('article')
    expect(metaContent(html, 'og:title')).toBe(heading)
    const image = metaContent(html, 'og:image')!
    expect(local(image)).toContain(`${href}/opengraph-image`)
    await expectImage(request, image)
  })
}

test('the sitemap lists every page in both Locales and every Article', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const xml = await response.text()
  const listed = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, url]) => url)

  for (const path of [...PAGES.ca, ...PAGES.es]) {
    expect(listed).toContain(path === '/' ? ORIGIN : `${ORIGIN}${path}`)
  }
  expect(xml).toContain(`hreflang="es" href="${ORIGIN}/es/about"`)

  for (const index of ['/blogs', '/es/blogs']) {
    const [href] = linksUnder(await (await request.get(index)).text(), `${index}/`)
    expect(listed).toContain(`${ORIGIN}${href}`)
  }
})

test('robots.txt points crawlers at the sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
})

test('the favicon set and manifest derived from the logo are linked and served', async ({ request }) => {
  const html = await (await request.get('/')).text()
  const icons = [...linkHrefs(html, 'icon'), ...linkHrefs(html, 'apple-touch-icon')]
  expect(icons).toEqual(expect.arrayContaining([expect.stringMatching(/^\/favicon\.ico/)]))
  expect(icons.length).toBeGreaterThanOrEqual(3)
  for (const href of icons) expect((await request.get(href)).status(), href).toBe(200)

  const [manifestHref] = linkHrefs(html, 'manifest')
  const manifest = await (await request.get(manifestHref)).json()
  expect(manifest.name).toBe('MRS Assessors')
  for (const { src } of manifest.icons) expect((await request.get(src)).status(), src).toBe(200)
})

test('no page asks for cookie consent', async ({ request }) => {
  for (const path of ['/', '/es', '/about', '/blogs']) {
    const html = await (await request.get(path)).text()
    expect(visibleText(html.replace(/<script[\s\S]*?<\/script>/g, '')), path).not.toMatch(/cookie/i)
  }
})
