# Configure the content webhook

Owner-only runbook. It needs the Contentful web app and the production server's
environment, neither of which an agent has.

## Why this is necessary

Content-backed pages regenerate hourly (`CONTENT_REVALIDATE_SECONDS` in
`lib/content/contentful.ts`). Without the webhook, that hour is also the longest
an edit can take to appear. The webhook closes that gap: Contentful calls
`/api/revalidate` on publish and the affected cache tag is dropped immediately.

The hourly window is itself the fix for the previous `revalidate: 1`, which
re-fetched on practically every request and spent the Delivery API quota. Do not
shorten it to compensate for a webhook that is not set up yet.

Until the webhook exists the site is correct, just up to an hour stale. The
endpoint refuses every call while `CONTENTFUL_WEBHOOK_SECRET` is unset, so there
is no window where it is reachable without a secret.

## Steps

`scripts/configure-content-webhook.sh` walks through every step below
interactively, including rotation. It generates the secret, checks production
with probes at each stage, and never writes the secret to disk or GitHub:

```bash
./scripts/configure-content-webhook.sh
```

### 1. Generate the shared secret

```bash
openssl rand -hex 32
```

This value goes in two places and nowhere else: the production environment and
the Contentful webhook's custom header. It is a credential — keep it out of
tracked files, exactly as `CONTENTFUL_ACCESS_KEY` is kept out (see
`docs/runbooks/rotate-contentful-credential.md`).

### 2. Put it in the production environment

1. SSH to the production host.
2. Add `CONTENTFUL_WEBHOOK_SECRET=<the value>` wherever the Contentful
   credentials already live (the deployed `.env`, a pm2 ecosystem file, or a
   `systemd` unit's `EnvironmentFile=` — confirm which, as the rotation runbook
   explains).
3. Restart the Next.js process. The value is read per request, but the process
   must restart to see a new environment at all.

### 3. Create the webhook in Contentful

1. Contentful > **Settings > Webhooks** > **Add webhook**.
2. Name: `revalidate-production`.
3. URL: `POST` to `https://www.mrsassessors.com/api/revalidate`.
4. Triggers: select **Entry** and **Asset**, for **publish** and **unpublish**
   only. Nothing else needs to invalidate a cache — `create` and `save` fire on
   every keystroke of a draft, and drafts are not served.
5. Headers: add a **custom header** named `X-Webhook-Secret` with the value from
   step 1. Mark it **secret** so it is masked in the Contentful UI.
6. Payload: leave it as the default entry/asset payload. The endpoint reads only
   `sys.type` and `sys.contentType.sys.id`.

### 4. Verify

1. In Contentful, publish a trivial change to an Article.
2. Contentful > **Settings > Webhooks** > `revalidate-production` > **Activity
   log**. The call should be `200` with a body naming the invalidated tag, e.g.
   `{"revalidated":["content:mrsBlog"]}`.
3. Load the Article on the site and confirm the change is there without waiting.

A `401` in the activity log means the header and the environment variable
disagree. A `503` means `CONTENTFUL_WEBHOOK_SECRET` is not set in the running
process — step 2's restart was missed.

### 5. Confirm it is not open

From any machine:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  -H 'content-type: application/json' \
  -d '{"sys":{"type":"Asset"}}' \
  https://www.mrsassessors.com/api/revalidate
```

This must print `401`. Anything else means the secret is not being checked, and
the endpoint can be used to force regeneration at will.

## Rotating the secret

Same shape as the delivery credential, and simpler because nothing else uses it:
set the new value in the production environment, restart, update the header in
Contentful, then confirm a publish still logs `200`. A brief `401` window
between the two updates only delays an edit to the next hourly regeneration.
