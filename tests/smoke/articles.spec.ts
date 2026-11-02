import { expect, test, type APIRequestContext } from '@playwright/test'
import { anchors, articleBody, linksUnder, region, visibleText as text } from './html'

const SECTION = {
  ca: { index: '/blogs', name: 'Notícies', retired: 'Actualitat' },
  es: { index: '/es/blogs', name: 'Noticias', retired: 'Actualidad' },
} as const

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

const html = async (request: APIRequestContext, path: string) => (await request.get(path)).text()

const firstArticle = async (request: APIRequestContext, index: string) => {
  const [href] = linksUnder(await html(request, index), `${index}/`)
  return { href, page: region(await html(request, href), 'main') }
}

const times = (markup: string) =>
  [...markup.matchAll(/<time\b[^>]*\bdatetime="([^"]*)"[^>]*>([\s\S]*?)<\/time>/gi)].map(
    ([, datetime, inner]) => ({ datetime, label: text(inner) }),
  )

for (const [locale, { index, name, retired }] of Object.entries(SECTION)) {
  test.describe(`The ${name} section (${locale})`, () => {
    test(`is titled ${name}`, async ({ request }) => {
      const main = region(await html(request, index), 'main')
      const [, heading = ''] = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) ?? []
      expect(text(heading)).toBe(name)
    })

    test(`is named ${name} in the site navigation, and ${retired} nowhere`, async ({ request }) => {
      const page = await html(request, index)
      const header = region(page, 'header')
      expect(anchors(header).find(({ href }) => href === index)?.text).toBe(name)
      for (const part of ['header', 'main', 'footer'] as const) {
        expect(text(region(page, part))).not.toContain(retired)
      }
    })

    test('lists its Articles as an ordered list, each dated', async ({ request }) => {
      const main = region(await html(request, index), 'main')
      const [, list = ''] = main.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/) ?? []
      const articles = new Set(linksUnder(list, `${index}/`))

      expect(articles.size, 'the index lists no Articles').toBeGreaterThan(0)
      expect(times(list)).toHaveLength(articles.size)
      for (const { datetime } of times(list)) expect(datetime).toMatch(ISO_DAY)
    })
  })

  test.describe(`An Article under ${index} (${locale})`, () => {
    test('shows its publication date, machine-readable', async ({ request }) => {
      const { page } = await firstArticle(request, index)
      const [published] = times(page)
      expect(published?.datetime).toMatch(ISO_DAY)
      expect(published?.label).toMatch(/\d{4}$/)
    })

    test(`links back to the ${name} index`, async ({ request }) => {
      const { page } = await firstArticle(request, index)
      const back = anchors(page).find(({ href }) => href === index)
      expect(back?.text).toContain(name)
    })

    test('renders its tags as discrete list items', async ({ request }) => {
      const { page } = await firstArticle(request, index)
      const [, list = ''] = page.match(/<ul\b[^>]*aria-label="[^"]+"[^>]*>([\s\S]*?)<\/ul>/) ?? []
      const tags = [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, inner]) => text(inner))

      expect(tags.length, 'no labelled tag list').toBeGreaterThan(0)
      for (const tag of tags) expect(tag).not.toBe('')
    })

    test('frames its feature image at a locked ratio', async ({ request }) => {
      const { page } = await firstArticle(request, index)
      const [frame = ''] = page.match(/<div\b[^>]*class="[^"]*\baspect-landscape\b[^"]*"[^>]*>/) ?? []
      const after = page.slice(page.indexOf(frame) + frame.length)

      expect(frame, 'no locked-ratio frame').not.toBe('')
      expect(after.trimStart()).toMatch(/^<img\b[^>]*images\.ctfassets\.net/)
    })

    test('sets its body in the shared reading column', async ({ request }) => {
      const { page } = await firstArticle(request, index)
      const article = articleBody(page)
      expect(article?.className.split(' ')).toContain('max-w-measure')
      expect(article!.inner).toMatch(/<p\b/)
    })
  })
}
