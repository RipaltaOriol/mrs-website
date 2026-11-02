import { contentTag } from './cache'

/** The content types the site renders; a change to any other invalidates nothing. */
export const READ_CONTENT_TYPES = ['mrsBlog', 'employees'] as const

export type RevalidationPlan =
  | { status: 200; tags: string[] }
  | { status: 400 | 401 | 503; error: string }

function contentTypeOf(payload: unknown): string | null | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  const { sys } = payload as { sys?: { type?: unknown; contentType?: unknown } }
  if (typeof sys !== 'object' || sys === null) return undefined

  // An Asset carries no content type: it may be linked from any entry.
  if (sys.type === 'Asset') return null

  const id = (sys.contentType as { sys?: { id?: unknown } } | undefined)?.sys?.id
  return typeof id === 'string' ? id : undefined
}

/** What a webhook call carrying `secret` should invalidate; with no secret configured, nothing passes. */
export function planRevalidation(secret: string | null, payload: unknown): RevalidationPlan {
  const expected = process.env.CONTENTFUL_WEBHOOK_SECRET
  if (!expected) {
    return {
      status: 503,
      error: 'CONTENTFUL_WEBHOOK_SECRET is not set, so no webhook call can be trusted.',
    }
  }
  if (secret !== expected) {
    return { status: 401, error: 'The webhook secret did not match.' }
  }

  const contentType = contentTypeOf(payload)
  if (contentType === undefined) {
    return { status: 400, error: 'The payload named neither an entry nor an asset.' }
  }
  if (contentType === null) {
    return { status: 200, tags: READ_CONTENT_TYPES.map(contentTag) }
  }
  const read = READ_CONTENT_TYPES.some((type) => type === contentType)
  return { status: 200, tags: read ? [contentTag(contentType)] : [] }
}
