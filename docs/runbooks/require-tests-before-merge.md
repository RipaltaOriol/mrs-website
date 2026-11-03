# Require tests to pass before merging

Owner-only runbook. It needs admin access to the repository's settings on GitHub,
which an agent does not have.

## Why this is necessary

`.github/workflows/tests.yml` runs the typecheck, the unit suite and the smoke and
interaction suites on every pull request. Two settings are needed on top of the
workflow:

- **Secrets.** The smoke and interaction suites run against a production build,
  and the build reads content from Contentful. Without the secrets the build
  fails and so does every run.
- **Branch protection.** On its own, the workflow only reports a result. A
  failing run blocks the merge only once `main` requires the check to pass.

## Steps

### 1. Add the Contentful secrets

Use the same read-only Delivery API values as `.env`:

```bash
gh secret set CONTENTFUL_SPACE_ID --repo RipaltaOriol/mrs-website
gh secret set CONTENTFUL_ACCESS_KEY --repo RipaltaOriol/mrs-website
```

Each command prompts for its value, so the value never ends up in shell history.
When the token is rotated, update this secret as well (see
`docs/runbooks/rotate-contentful-credential.md`).

### 2. Run the workflow once

Open a pull request and wait for the **Tests** check to go green. GitHub only
lets you pick a status check as required after it has run at least once.

### 3. Protect `main`

GitHub > Settings > Branches > Add branch ruleset (or classic branch protection
rule) for `main`:

- Require a pull request before merging.
- Require status checks to pass, and add `tests` and `comments`.
- Require branches to be up to date before merging.

### 4. Verify

Push a commit that breaks a test to a pull request. The merge button should stay
blocked until the commit is reverted.
