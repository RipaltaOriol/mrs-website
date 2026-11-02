# MRS Assessors
I developed this website for the MRS Assessors, a local legal consulting firm. The technologies used for the project include Next.js, i18n, and Contentful (server-side CMS).

Production [URL](https://www.mrsassessors.com/)

## Local setup

Next.js 15 (App Router), TypeScript, Tailwind CSS v4 and next-intl.

```bash
npm install
cp .env.example .env   # then fill in the Contentful values
npm run dev
```

`.env` is gitignored and must never be committed — see
[the rotation runbook](docs/runbooks/rotate-contentful-credential.md).

## Checks

```bash
npm run typecheck
npm run test:unit         # the content boundary and the design tokens, over fixtures
npm run test:smoke        # builds, starts on :3100, and checks every route over HTTP
npm run test:interaction  # drives the built site in Chromium
```

`test:interaction` needs browser binaries: `npx playwright install chromium`.

The unit specification (`tests/unit/`) covers the content boundary: what each
content type resolves to, and which malformed responses fail the build.

The smoke specification (`tests/smoke/`) covers URL shape in both Locales,
`hreflang` alternates, document language, the Locale switcher, the header and
footer markup, the localised 404 and the content-backed routes. It needs no
browser binaries, but it does need working Contentful credentials, because it
builds the site.

The interaction specification (`tests/interaction/`) covers what only a rendered
page can show: the header hairline appearing on scroll, the full-screen mobile
navigation and keyboard reachability with a visible focus ring. See
[ADR-0004](docs/adr/0004-browser-driven-interaction-specification.md).

## Where things live

- `app/[locale]/`: one route per page; Catalan is served unprefixed, Spanish under `/es`
- `lib/content/`: the only way the site reads content. Pages call `getArticles`,
  `getArticle`, `getEmployees` and `getPartners` and get domain objects back;
  nothing outside this directory knows Contentful exists
- `i18n/`: next-intl routing, navigation and message loading from `locales/{ca,es}/*.json`
- `app/globals.css`: the single `@theme` block, the only place colours, type steps and spacing are defined
- `lib/offices.ts`: the firm's two Offices, read by both the Offices section and the footer
- `lib/contact.ts`: the firm's telephone numbers and email address, read by the same two

## Content

Contentful holds Articles and Employees (ADR-0003). Pages regenerate hourly; a
content webhook invalidates the affected cache tag on publish, so an edit does
not wait that hour. Setting the webhook up is owner-only work:
[the webhook runbook](docs/runbooks/configure-content-webhook.md).

A missing credential, an empty response or a field that is absent, blank or the
wrong type fails the build with the content type, the entry and the field named.
The site does not render partial content.
