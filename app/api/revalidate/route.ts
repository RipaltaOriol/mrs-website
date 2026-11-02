import { revalidateTag } from 'next/cache'
import { planRevalidation } from '@/lib/content/revalidate'

/** The header Contentful is configured to repeat back. */
const SECRET_HEADER = 'x-webhook-secret'

/** On-demand revalidation for the content webhook (`docs/runbooks/configure-content-webhook.md`). */
export async function POST(request: Request) {
  // Public endpoint: a malformed body is refused with a 400.
  const payload = await request.json().catch(() => null)
  const plan = planRevalidation(request.headers.get(SECRET_HEADER), payload)

  if (plan.status !== 200) {
    return Response.json({ error: plan.error }, { status: plan.status })
  }

  for (const tag of plan.tags) revalidateTag(tag)
  return Response.json({ revalidated: plan.tags })
}
