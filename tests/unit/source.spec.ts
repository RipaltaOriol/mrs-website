import { expect, test } from '@playwright/test'
import { CONTENT_REVALIDATE_SECONDS, contentTag } from '@/lib/content/cache'
import { contentful } from '@/lib/content/contentful'

test('a missing credential is reported before any request is attempted', async () => {
  const saved = process.env.CONTENTFUL_ACCESS_KEY
  delete process.env.CONTENTFUL_ACCESS_KEY
  try {
    await expect(contentful.entries('employees')).rejects.toThrow(
      'CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_KEY must both be set',
    )
  } finally {
    // Assigning `saved` back would set the string "undefined" if it was unset.
    if (saved === undefined) delete process.env.CONTENTFUL_ACCESS_KEY
    else process.env.CONTENTFUL_ACCESS_KEY = saved
  }
})

test('each content type carries its own revalidation tag, matched to the webhook', () => {
  expect(contentTag('mrsBlog')).toBe('content:mrsBlog')
  expect(contentTag('employees')).toBe('content:employees')
})

// The acceptance criterion is hourly, so the number is pinned here rather than
// only being compared against the route literals, which could drift together.
test('content is regenerated hourly', () => {
  expect(CONTENT_REVALIDATE_SECONDS).toBe(60 * 60)
})
