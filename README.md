# MRS Assessors
I developed this website for the MRS Assessors, a local legal consulting firm. The technologies used for the project include Next.js, i18n, and Contentful (server-side CMS).

Production [URL](https://www.mrsassessors.com/)

## Local setup

```bash
npm install
cp .env.example .env   # then fill in the two Contentful values
npm run dev
```

Both variables must be set: the home, about and blog pages read their content
from Contentful and fail outright without a valid token. `.env` is gitignored and
must never be committed — see
[the rotation runbook](docs/runbooks/rotate-contentful-credential.md).
