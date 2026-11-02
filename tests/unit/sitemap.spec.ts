import { expect, test } from '@playwright/test'
import { routing } from '@/i18n/routing'
import { PAGES } from '@/lib/pages'
import { sitemapEntries } from '@/lib/sitemap'

const ORIGIN = 'https://www.mrsassessors.com'

const articles = {
  ca: [{ slug: 'nova-llei', published: new Date('2024-03-05T00:00:00.000Z') }],
  es: [
    { slug: 'nueva-ley', published: new Date('2024-03-06T00:00:00.000Z') },
    { slug: 'irpf-2024', published: new Date('2024-01-10T00:00:00.000Z') },
  ],
}

test('every declared page is listed once in each Locale, each naming its counterparts', () => {
  const entries = sitemapEntries(articles)
  const about = entries.filter((entry) => entry.url.endsWith('/about'))

  expect(about.map((entry) => entry.url)).toEqual([`${ORIGIN}/about`, `${ORIGIN}/es/about`])
  for (const entry of about) {
    expect(entry.alternates).toEqual({
      languages: { ca: `${ORIGIN}/about`, es: `${ORIGIN}/es/about`, 'x-default': `${ORIGIN}/about` },
    })
  }

  const pages = entries.filter((entry) => !entry.url.includes('/blogs/')).map((entry) => entry.url)
  expect(new Set(pages).size).toBe(pages.length)
  expect(pages).toHaveLength(Object.keys(PAGES).length * routing.locales.length)
})

test('every Article is listed once in its own Locale, dated, with no counterparts', () => {
  const entries = sitemapEntries(articles).filter((entry) => entry.url.includes('/blogs/'))

  expect(entries).toEqual([
    { url: `${ORIGIN}/blogs/nova-llei`, lastModified: new Date('2024-03-05T00:00:00.000Z') },
    { url: `${ORIGIN}/es/blogs/nueva-ley`, lastModified: new Date('2024-03-06T00:00:00.000Z') },
    { url: `${ORIGIN}/es/blogs/irpf-2024`, lastModified: new Date('2024-01-10T00:00:00.000Z') },
  ])
})
