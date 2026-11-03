# Rotate the leaked credentials

Owner-only runbook. It needs Contentful, the production server, the Vercel
project and the `mrsassessors@gmail.com` Google account, none of which an agent
has.

`scripts/rotate-leaked-credentials.sh` walks through every step below
interactively. It checks each token against the Delivery API, probes production,
refuses to delete the leaked key until production and preview are confirmed, and
proves the deletion by watching the leaked token get `401`:

```bash
./scripts/rotate-leaked-credentials.sh
```

## Why this is necessary

`d171f57` ("initial", 2021-12-25) committed two credentials to
`RipaltaOriol/mrs-website`, a public repository:

- `.env`, holding `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_KEY`.
- `todos.txt`, holding the `mrsassessors@gmail.com` password in plaintext.

Both have since been removed from the tip (`.env` untracked and gitignored in
`1fa1370`), which **does not close either leak**. They are still reachable in
the public history, and anyone who cloned, forked or read the repository through
the GitHub API already has them. Rewriting history would not help either: the old
objects stay resolvable through forks and cached views. The only fix is to issue
new credentials and revoke the old ones. **Rotation is mandatory.**

The exposed token is a Content Delivery API key: read-only, so its blast radius
is read access to published content. No write or Management token was exposed.

`CONTENTFUL_SPACE_ID` is an identifier, not a secret. A new key is issued against
the same space, so it does not change. Only the access token is replaced.

## Where the token lives

| Where | What | Picks up a new value by |
| --- | --- | --- |
| Production server | Private nginx/Ubuntu host serving `www.mrsassessors.com` | Restarting the Next.js process |
| Vercel | Preview deployments only; not tied to the real domain | A new deployment |
| Each developer's `.env` | Local development | Restarting `next dev` |

All three must hold the new token before the old key is deleted, or whatever
still holds the old one stops reading content.

Confirm the production host before trusting the table: `curl -sI
https://www.mrsassessors.com/` reports `Server: nginx/1.18.0 (Ubuntu)` and
`X-Powered-By: Next.js`. Nothing in the repository pins it.

## How a bad token fails

Content is read by App Router server components through `lib/content`, cached per
content type for an hour and dropped early by the content webhook
(`docs/runbooks/configure-content-webhook.md`). A missing or wrong credential
throws a `ContentError` naming the variable, and fails the build rather than
rendering an empty page. That makes `npm run build` an honest check of a token.

Server components read `process.env` from the long-running Node process, so a
restart is what picks up a new token on the server. Without one, the process
keeps using the token it started with.

Until `feat/refactor-site` is deployed, production still runs the earlier Pages
Router build (`/api/revalidate` answers `404`). That build serves its last good
page when a regeneration fails, so a page loading is not proof the token works
there: read the process logs for `401` or `AccessTokenInvalid`.

## Steps

### 1. Issue a new delivery token

1. Contentful > **Settings > API keys** > **Add API key**. Name it datably, e.g.
   `production-2026-11`.
2. Copy the **Content Delivery API - access token**, not the Preview or
   Management token.
3. Leave the old key in place until step 6.

### 2. Update the production server

1. SSH to the production server.
2. Find where the token is supplied:
   `grep -rl CONTENTFUL_ACCESS_KEY <app dir> ~/.pm2 /etc/systemd/system`. It is
   usually the app's `.env`, possibly a pm2 ecosystem file or a `systemd`
   `EnvironmentFile=`.
3. Back the file up (`cp <file> ~/env-backup-$(date +%F)`).
4. Replace `CONTENTFUL_ACCESS_KEY`. Leave `CONTENTFUL_SPACE_ID` as it is.
5. Restart: `pm2 restart <app> --update-env`, or
   `sudo systemctl daemon-reload && sudo systemctl restart <unit>`.

### 3. Verify production

1. Load `/`, `/about`, `/blogs` and `/es` and confirm Articles and Employees
   render. Partner biographies come from `locales/{ca,es}/home.json`, not
   Contentful (see the revision at the foot of ADR-0003), so they say nothing
   about the token.
2. Read the process logs since the restart (`pm2 logs <app> --lines 100
   --nostream` or `journalctl -u <unit> -n 100`). There must be no `401`,
   `AccessTokenInvalid` or `ContentError`.

### 4. Update Vercel

1. Vercel > the project > **Settings > Environment Variables** > edit
   `CONTENTFUL_ACCESS_KEY` for every environment it lists, Preview at least.
2. Redeploy the newest preview. Variables only reach new deployments.
3. Confirm the build succeeds and `/blogs` lists Articles.

### 5. Update local development

Replace `CONTENTFUL_ACCESS_KEY` in your untracked `.env` (copy `.env.example` if
there is none), then run `npm run build`. To check the token alone without a
build:

```bash
node -e "require('@next/env').loadEnvConfig(process.cwd(), true);
const {createClient}=require('contentful');
createClient({space:process.env.CONTENTFUL_SPACE_ID,accessToken:process.env.CONTENTFUL_ACCESS_KEY})
  .getEntries({content_type:'mrsBlog',limit:1})
  .then(r=>console.log('OK',r.total)).catch(e=>{console.log('FAILED',e.name);process.exit(1)})"
```

The site reads two content types, `mrsBlog` (Articles) and `employees`. Check
either; `team`, `slider` and `genericImages` are retired and prove nothing.

### 6. Delete the leaked key

Only once steps 3 to 5 are clean:

1. Contentful > **Settings > API keys** > the old key > **Delete**.
2. Confirm the old token is refused. With the old value in `$OLD`:
   `curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $OLD"
   "https://cdn.contentful.com/spaces/<space>/environments/master/entries?limit=1"`
   must print `401`.
3. Confirm production still serves, then delete the server backup from step 2,
   which now holds only a dead token.

## Rotate the Google account password

The `mrsassessors@gmail.com` password has been public since 2021-12-25. Treat it
as compromised.

1. Change it at https://myaccount.google.com/signinoptions/password to one
   generated by a password manager, and store it only there.
2. Sign out unrecognised sessions at https://myaccount.google.com/device-activity.
3. Turn on 2-Step Verification at
   https://myaccount.google.com/signinoptions/two-step-verification, preferring a
   passkey or authenticator app to SMS. Keep the backup codes in the password
   manager.
4. Work through https://myaccount.google.com/security-checkup: recovery options,
   third-party access, recent activity.
5. Change the password everywhere else it was used: the password manager's reuse
   report, plus anything signed up with this address (domain registrar, the
   server's host, Contentful, Vercel).

## Preventing a repeat

- `.env` is gitignored; `.env.example` documents the key names with no values.
- No credential belongs in a tracked file, `todos.txt` included.
- Write credentials stay out of the repository entirely: see
  `docs/adr/0003-contentful-holds-only-frequently-edited-content.md`.
