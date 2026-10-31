# Contentful holds only frequently edited content

Contentful previously held Articles, Partner photographs, Employees, the homepage
slider and a pair of generic page images. We narrowed it to the content that
genuinely changes: Articles, Employees, and Partner biographies, which moved in
from hardcoded JSX. Practice areas and Office addresses stay in the locale JSON
files, and design imagery moved into the repository under `public/`. The `slider`
and `genericImages` content types were retired.

A content management system earns its cost for content edited often by people who
cannot deploy. Here that describes Articles and nothing else: the nine practice
areas had not changed in five years. Keeping them in locale JSON makes them
versioned, diffable and reviewable in a pull request, and removes a build-time
network call, at the cost of a deploy to change them, which was happening anyway.

## Consequences

- Design imagery is deliberately not editable without a deploy. It is part of the
  layout, not the content, and the distinction is the point.
- Schema changes to Contentful are made through a committed `contentful-migration`
  script, run by the repository owner with their own management token, so no write
  credential enters the repository.
