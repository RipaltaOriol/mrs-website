// Next accepts only a literal for a segment's `revalidate`, so each route repeats
// this number; `tests/unit/revalidate.spec.ts` keeps them equal.
/** Seconds a content response is served before it is fetched again. */
export const CONTENT_REVALIDATE_SECONDS = 3600

/** The cache tag the webhook invalidates for one content type. */
export function contentTag(contentType: string): string {
  return `content:${contentType}`
}
