# MRS Assessors
I developed this website for the MRS Assessors, a local legal consulting firm. The technologies used for the project include Next.js, i18n, and Contentful (server-side CMS).

Production [URL](https://www.mrsassessors.com/)

## Local setup

Next.js 15 (App Router), TypeScript, Tailwind CSS v4 and next-intl.

```bash
npm install
cp .env.example .env   # then fill in the two Contentful values
npm run dev
```

`.env` is gitignored and must never be committed — see
[the rotation runbook](docs/runbooks/rotate-contentful-credential.md).

## Checks

```bash
npm run typecheck
npm run test:smoke   # builds, starts on :3100, and checks every route over HTTP
```

The smoke specification (`tests/smoke/`) covers URL shape in both Locales,
`hreflang` alternates, document language, the Locale switcher and 404 status.
It needs no browser binaries.

## Where things live

- `app/[locale]/`: one route per page; Catalan is served unprefixed, Spanish under `/es`
- `i18n/`: next-intl routing, navigation and message loading from `locales/{ca,es}/*.json`
- `app/globals.css`: the single `@theme` block, the only place colours, type steps and spacing are defined
