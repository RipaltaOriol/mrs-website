# Contentful holds only frequently edited content

Contentful previously held Articles, Partner photographs, Employees, the homepage
slider and a pair of generic page images. We narrowed it to the content that
genuinely changes: Articles and Employees. Practice Areas, Office addresses and
Partner biographies stay in the locale JSON files, and design imagery moved into
the repository under `assets/imagery/`, statically imported through
`lib/imagery.ts`. The `slider`, `genericImages` and `team` content types were
retired.

A content management system earns its cost for content edited often by people who
cannot deploy. Here that describes Articles and Employees and nothing else: the
nine Practice Areas had not changed in five years, and neither had the three
Partner biographies. Keeping them in locale JSON makes them versioned, diffable
and reviewable in a pull request, and removes a build-time network call, at the
cost of a deploy to change them, which was happening anyway.

## Consequences

- Design imagery is deliberately not editable without a deploy. It is part of the
  layout, not the content, and the distinction is the point.
- Schema changes to Contentful are made through a committed `contentful-migration`
  script, run by the repository owner with their own management token, so no write
  credential enters the repository.

## Revision: Partner biographies never moved into Contentful

As first written, this ADR recorded Partner biographies as moving into Contentful.
They did not, and the decision above now says so. The reasoning is kept here
rather than dropped, because the original wording shipped and `#8` was specified
against it.

When the typed content boundary was built (#3), the space held no field for them:
the `team` content type carries a `profileName` and a photograph and nothing
else, and the photographs are retired by #8. Adding a biography field would have
meant a `contentful-migration` script, a management token, and the owner
re-authoring text that already exists in `locales/{ca,es}/home.json` — with the
build failing until all three were done.

The decision above is what settled it: a content management system earns its cost
for content edited often. Nine Practice Areas had not changed in five years; the
three Partner biographies had not either. They are the same kind of content as
the Practice Areas, so they stay where the Practice Areas stay.

Partners still resolve through the content boundary (`getPartners`), guarded the
same way as Articles and Employees, so a half-translated locale file fails the
build with the key named rather than rendering a Partner with no biography. The
boundary reads the locale file directly rather than through next-intl, which
answers a key it cannot resolve with the key path itself (`"home.saisBio"`) — a
non-blank string that would otherwise have rendered as a biography line. What
changed is the source behind the boundary, not the boundary.

So Contentful holds **Articles and Employees**. The `team` content type is no
longer read by anything and is retired alongside `slider` and `genericImages`.

Issue #8 still asks for biographies "sourced from the content system" and for a
committed migration script. Both are superseded by this revision, and #8 needs
amending before it is implemented.
