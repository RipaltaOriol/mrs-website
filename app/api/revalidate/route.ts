import { revalidateTag } from 'next/cache'
import { planRevalidation } from '@/lib/content/revalidate'

/** The header Contentful is configured to repeat back. */
const SECRET_HEADER = 'x-webhook-secret'

/**
 * On-demand revalidation for a content webhook.
 *
 * Contentful POSTs the changed entry or asset here on publish and unpublish.
 * Regeneration is otherwise hourly (`CONTENT_REVALIDATE_SECONDS`), so this is
 * what makes an edit appear straight away without putting the site back on the
 * one-second window that spent the Delivery API quota.
 *
 * Configuring the webhook is owner-only work:
 * `docs/runbooks/configure-content-webhook.md`.
 */
export async function POST(request: Request) {
  // A malformed body is a refusal, not a crash: this endpoint is public.
  const payload = await request.json().catch(() => null)
  const plan = planRevalidation(request.headers.get(SECRET_HEADER), payload)

  if (plan.status !== 200) {
    return Response.json({ error: plan.error }, { status: plan.status })
  }

  for (const tag of plan.tags) revalidateTag(tag)
  return Response.json({ revalidated: plan.tags })
}
