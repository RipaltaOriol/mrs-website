import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { CONTENT_REVALIDATE_SECONDS } from '@/lib/content/cache'
import { planRevalidation } from '@/lib/content/revalidate'

const SECRET = 'a-shared-secret'

const entryPublished = (contentType: string) => ({
  sys: { type: 'Entry', id: '6CZFHcyNy7Fo8DoYirQWJm', contentType: { sys: { id: contentType } } },
})

test.beforeEach(() => {
  process.env.CONTENTFUL_WEBHOOK_SECRET = SECRET
})

test('a publish naming a content type invalidates only that tag', () => {
  expect(planRevalidation(SECRET, entryPublished('mrsBlog'))).toEqual({
    status: 200,
    tags: ['content:mrsBlog'],
  })
})

test('an Asset change invalidates every content type, since any may link it', () => {
  const asset = { sys: { type: 'Asset', id: '2RagCrIYMu0DMeBzhi1UFo' } }
  expect(planRevalidation(SECRET, asset)).toEqual({
    status: 200,
    tags: ['content:mrsBlog', 'content:employees'],
  })
})

test('a wrong or absent secret is refused', () => {
  expect(planRevalidation('wrong', entryPublished('mrsBlog')).status).toBe(401)
  expect(planRevalidation(null, entryPublished('mrsBlog')).status).toBe(401)
})

test('an unconfigured secret refuses every call rather than accepting any', () => {
  delete process.env.CONTENTFUL_WEBHOOK_SECRET
  const outcome = planRevalidation(null, entryPublished('mrsBlog'))
  expect(outcome.status).toBe(503)
  expect(outcome).toMatchObject({ error: /CONTENTFUL_WEBHOOK_SECRET/ })
})

test('a content type the site does not read is acknowledged without invalidating', () => {
  // `slider` is still in the content space but nothing renders it.
  expect(planRevalidation(SECRET, entryPublished('slider'))).toEqual({ status: 200, tags: [] })
})

test('a payload that names nothing recognisable is refused', () => {
  expect(planRevalidation(SECRET, { hello: 'world' }).status).toBe(400)
  expect(planRevalidation(SECRET, null).status).toBe(400)
})

// Next accepts only a literal for a segment's `revalidate`.
test('every content-backed route regenerates on the same hourly window', async () => {
  const routes = [
    'app/[locale]/page.tsx',
    'app/[locale]/blogs/page.tsx',
    'app/[locale]/blogs/[slug]/page.tsx',
  ]

  for (const route of routes) {
    const source = await readFile(route, 'utf8')
    const declared = source.match(/^export const revalidate = (\d+)$/m)?.[1]
    expect(declared, `${route} declares no revalidate`).toBe(String(CONTENT_REVALIDATE_SECONDS))
  }
})
