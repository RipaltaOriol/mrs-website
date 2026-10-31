# Rotate the Contentful delivery credential

Owner-only runbook. The repository owner must action every step here: it needs
access to Contentful and to the production server, neither of which an agent has.

## Why this is necessary

`.env` was committed in `d171f57` ("initial", 2021-12-25) and stayed tracked in
`RipaltaOriol/mrs-website`, a public repository. It held
`CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_KEY`.

The file is now untracked and gitignored, but **that does not close the leak**.
The credential is still reachable in the public history, and anyone who cloned or
forked the repository, or read it through the GitHub API, already has it. Removing
a secret from the tip of a branch never unpublishes it.

Rewriting history would not close it either: the old objects stay resolvable
through forks and cached views, and rewriting breaks every existing clone. The
only action that actually revokes access is issuing a new token and deleting the
old one. **Rotation is mandatory, not optional.**

The exposed token is a Content Delivery API key, which is read-only, so the blast
radius is read access to published content in the space. No write or Management
token was exposed.

`CONTENTFUL_SPACE_ID` is an identifier, not a secret, and it does **not** change
here: a new API key is issued against the same space, so the space ID stays as it
is. Only the access token is replaced.

## Steps

### 0. First: stop this commit from taking production down

`.env` was *tracked* until this commit. If the production host deploys by pulling
this repository, the pull that brings in this commit will try to remove the
server's `.env` — deleting it if its contents match the committed version, or
refusing to merge if they differ. If it is deleted, all four Contentful-backed
pages return 500: `pages/index.js`, `pages/about.js`, `pages/blogs.js` and
`pages/blogs/[slug].js` have no error handling around their Contentful calls.

Before deploying this commit:

1. SSH to the production host and record the live values somewhere safe
   (`cp .env ~/env-backup-$(date +%F)`).
2. Confirm where the credential is actually supplied. This runbook assumes a
   `.env` in the app directory, but it may instead be a pm2 ecosystem file, a
   `systemd` unit's `Environment=`/`EnvironmentFile=`, or a shell profile.
   Adjust the steps below to match.
3. After deploying, confirm the credential is still in place before moving on.

Once `.env` is gitignored, later pulls leave it alone. It is only this one commit
that is dangerous.

### 1. Issue a new delivery token in Contentful

1. Contentful > **Settings > API keys**.
2. **Add API key**. Name it something datable, e.g. `production-2026-10`.
3. Copy the **Content Delivery API - access token**. Do not copy the Preview or
   Management token. The **Space ID** shown alongside it is unchanged.
4. Leave the old key in place for now, so production keeps serving while you
   roll the new one out.

### 2. Update the production server

Production is Next.js behind nginx on Ubuntu, not Vercel — verified with
`curl -sI https://www.mrsassessors.com/` (`Server: nginx/1.18.0 (Ubuntu)`,
`X-Powered-By: Next.js`). Re-check that before trusting it; nothing in the
repository pins the deployment target, and the `.vercel` entry in `.gitignore`
is `create-next-app` boilerplate, not evidence of the host.

So the credential lives in the server's own environment, not in a hosting
dashboard:

1. SSH to the production host.
2. Replace `CONTENTFUL_ACCESS_KEY` in the deployed `.env`. Leave
   `CONTENTFUL_SPACE_ID` as it is.
3. Restart the Next.js process (whatever supervises it: `pm2 restart <app>`,
   `systemctl restart <unit>`, …).

A restart is required, not just a content redeploy. The four Contentful-backed
pages use `getStaticProps` with `revalidate: 1`, and `pages/blogs/[slug].js`
builds its Contentful client at module scope, so the long-running Node process
keeps using the values it started with until it is restarted.

> Contradicts ADR-0002, which records Contentful fetching as having moved "from
> `getStaticProps` to async server components". The code at this commit is still
> on the Pages Router with `getStaticProps`, so the above describes what is
> actually deployed. Once ADR-0002 lands, the `revalidate: 1` detail changes but
> the conclusion does not: server components read `process.env` from the same
> long-running process, so a restart is still what picks up a new token.

### 3. Verify production

1. Load https://www.mrsassessors.com/, `/about` and `/blogs` and confirm the
   Contentful-backed content still renders — Articles, the Team and Partner
   biographies. If the token is wrong these pages fail outright rather than
   degrading, because there is no error handling around `getStaticProps`.
2. Check the process logs for Contentful `401`/`AccessTokenInvalid` errors.

> ADR-0003 records the `slider` and `genericImages` content types as retired,
> but `pages/index.js` at this commit still fetches both. If the homepage breaks
> after rotation, check that before suspecting the token.

### 4. Delete the leaked key

Only once step 3 is clean:

1. Contentful > **Settings > API keys** > the old key > **Delete**.
2. Confirm production is still healthy afterwards. This is the step that
   actually revokes the leaked credential.

### 5. Update local development

Every developer replaces the token in their own untracked `.env`, copying
`.env.example` if they do not have one.

To check that an untracked `.env` is actually being picked up without running a
full build:

```bash
node -e "require('@next/env').loadEnvConfig(process.cwd(), true);
const {createClient}=require('contentful');
createClient({space:process.env.CONTENTFUL_SPACE_ID,accessToken:process.env.CONTENTFUL_ACCESS_KEY})
  .getEntries({content_type:'team'})
  .then(r=>console.log('OK',r.total)).catch(e=>{console.log('FAILED',e.name);process.exit(1)})"
```

This is worth knowing because `npm run build` currently fails on this repo for an
unrelated reason — Next 10.0.8 against Node 26 throws
`ERR_PACKAGE_PATH_NOT_EXPORTED` on postcss — so a failing build does not tell you
anything about your credential.

## Also leaked: the shared Google account password

`todos.txt` carried the `mrsassessors@gmail.com` password in plaintext in the
same public repository, from the same `d171f57` commit. The password has been
removed from the file, which — exactly as above — does not close the leak.

**Change that password in Google, and enable 2FA on the account.** Treat it as
compromised since 2021-12-25. If that account was reused anywhere else, change
it there too. Keep it in a password manager, never in the repository.

## Preventing a repeat

- `.env` is in `.gitignore`; `.env.example` documents the key names with no values.
- No credential belongs in a tracked file, `todos.txt` included.
- Write credentials stay out of the repository entirely: see
  `docs/adr/0003-contentful-holds-only-frequently-edited-content.md`.
