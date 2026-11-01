import { createClient } from 'contentful'
import { unstable_cache } from 'next/cache'
import { CONTENT_REVALIDATE_SECONDS, contentTag } from './cache'
import { ContentError } from './decode'
import type { ContentEntry, ContentSource } from './source'

/** How many entries one Delivery API request returns; its maximum is 1000. */
const PAGE_SIZE = 100

function deliveryClient() {
  const space = process.env.CONTENTFUL_SPACE_ID
  const accessToken = process.env.CONTENTFUL_ACCESS_KEY
  if (!space || !accessToken) {
    throw new ContentError(
      'CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_KEY must both be set to read content. ' +
        'Copy .env.example to .env and fill in both values.',
    )
  }
  return createClient({ space, accessToken })
}

async function fetchEntries(contentType: string): Promise<ContentEntry[]> {
  const client = deliveryClient()
  const entries: ContentEntry[] = []

  // Paged to the end rather than capped: a cap would silently drop the
  // entries past it, which is the one broken response that looks like a
  // healthy one.
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const response = await client.getEntries({
      content_type: contentType,
      // Newest first, and a defined order at all: the Delivery API does not
      // promise one otherwise.
      order: ['-sys.createdAt'],
      // Resolves the Asset links one level down, which is as deep as any
      // content type here nests. Without it every image is an unresolved link.
      include: 1,
      limit: PAGE_SIZE,
      skip,
    })

    entries.push(
      ...response.items.map((item) => ({
        id: item.sys.id,
        createdAt: item.sys.createdAt,
        fields: item.fields as Record<string, unknown>,
      })),
    )

    if (entries.length >= response.total || response.items.length === 0) return entries
  }
}

/** The live Delivery API, cached per content type under its own tag. */
export const contentful: ContentSource = {
  async entries(contentType) {
    // Checked here rather than inside the cached function so a missing
    // credential fails the build immediately instead of being cached, and
    // rejects the promise rather than throwing past an `await`.
    deliveryClient()

    return unstable_cache(() => fetchEntries(contentType), ['content', contentType, 'dated'], {
      tags: [contentTag(contentType)],
      revalidate: CONTENT_REVALIDATE_SECONDS,
    })()
  },
}
