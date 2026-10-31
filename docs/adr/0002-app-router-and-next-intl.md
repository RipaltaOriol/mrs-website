# Move to the App Router and replace next-translate with next-intl

The site ran on Next 10's Pages Router with next-translate, which relies on Next's
built-in `i18n` config. That config does not exist in the App Router, so adopting
the App Router necessarily meant replacing the i18n layer: locale routing becomes
a `[locale]` segment plus middleware, and translation lookup moves to next-intl.
We accepted that rewrite rather than staying on the Pages Router, because the site
had already aged badly once and the Pages Router is the path Next is steering away
from. At eight pages the cost was bounded, and Contentful fetching got simpler in
the process, moving from `getStaticProps` to async server components.

## Consequences

- Published URLs are unchanged. next-intl uses `localePrefix: 'as-needed'`, which
  reproduces the previous shape exactly: Catalan unprefixed at `/`, Spanish at
  `/es/...`. Nothing already indexed breaks.
- The `locales/{ca,es}/*.json` content carried over unchanged; only the plumbing
  was rewritten.
