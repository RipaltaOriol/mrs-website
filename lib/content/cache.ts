/**
 * How long a content response is served before it is fetched again.
 *
 * An hour, not the one second the Pages Router shipped with: at `revalidate: 1`
 * every request past the first second re-fetched, which is what spent the
 * Delivery API quota. Edits do not wait an hour — the content webhook
 * invalidates the affected tag on publish (`app/api/revalidate`).
 *
 * Each route segment repeats this number as a literal, because Next only
 * accepts a literal there. `tests/unit/revalidate.spec.ts` fails if one drifts.
 */
export const CONTENT_REVALIDATE_SECONDS = 3600

/** The cache tag the webhook invalidates for one content type. */
export function contentTag(contentType: string): string {
  return `content:${contentType}`
}
