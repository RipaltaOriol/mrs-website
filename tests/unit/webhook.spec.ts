import { expect, test } from '@playwright/test'
import { POST } from '@/app/api/revalidate/route'

const SECRET = 'a-shared-secret'

const call = (headers: Record<string, string>, body: unknown) =>
  POST(
    new Request('https://www.mrsassessors.com/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  )

test.beforeEach(() => {
  process.env.CONTENTFUL_WEBHOOK_SECRET = SECRET
})

// An accepted call reaches `revalidateTag`, which needs Next's request store,
// so that path is covered by the smoke specification against a real server.
test('a call bearing no secret is refused and invalidates nothing', async () => {
  const response = await call({}, { sys: { type: 'Asset', id: 'abc' } })
  expect(response.status).toBe(401)
  expect(await response.json()).toEqual({ error: 'The webhook secret did not match.' })
})

test('a body that is not JSON is refused rather than crashing the route', async () => {
  const response = await POST(
    new Request('https://www.mrsassessors.com/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-webhook-secret': SECRET },
      body: 'not json at all',
    }),
  )
  expect(response.status).toBe(400)
})
