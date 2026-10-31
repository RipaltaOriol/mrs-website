# Replace Bootstrap with Tailwind v4 design tokens

The 2021 site styled itself with Bootstrap 5 plus react-bootstrap, overridden by
CSS Modules that restated the brand colour `#830b30` by hand in roughly twenty
places and fought Bootstrap's defaults with `!important`. Three colour systems
coexisted and none of them held the logo's actual red, `#99032E`. We removed
Bootstrap, react-bootstrap and react-bootstrap-icons entirely and moved to
Tailwind v4, where a single `@theme` block is the only place a colour, type step
or spacing value can be defined, so duplication is structurally impossible rather
than merely discouraged.

## Consequences

- Tailwind v4 relies on `@property`, `color-mix()` and cascade layers, setting the
  browser floor at Safari 16.4+, Chrome 111+ and Firefox 128+. Below that, layout
  holds but colour and some spacing degrade. Accepted knowingly and without
  analytics data, on the grounds that the failure is cosmetic and pre-2023 iOS is
  now a small minority.
- The two interactive components Bootstrap used to provide, the mobile navigation
  and the practice-area disclosure, are hand-rolled rather than taken from a
  headless library, to avoid adding dependency surface for roughly eighty lines.
