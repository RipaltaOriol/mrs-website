# Drive a browser for the interaction specification

The site had two specifications, neither of which opened a browser. The unit
specification runs in-process over fixtures; the smoke specification asserts on
the HTML a production build sends. Both are fast and neither needs browser
binaries.

The header and footer brought requirements that neither can observe: a hairline
rule that appears on scroll, a full-screen mobile navigation that traps Tab and
closes on Escape, and a focus indicator that a sighted keyboard user can
actually see. All three are properties of a laid-out, scripted, styled page.

We added a third specification, `tests/interaction/`, as a second Playwright
project in `playwright.config.ts` sharing the one production build the smoke
project already starts. It asserts on computed style, bounding boxes, real key
presses and `document.activeElement`.

## Alternatives

- **Assert on the source and stop there.** Check `aria-expanded` in the server
  HTML and the `@apply` rules in `app/globals.css`, as the design specification
  already does for tokens and contrast. Rejected as the whole answer: a focus
  ring can be present in the stylesheet and still be invisible behind a surface
  colour, and a menu can carry correct ARIA and still not trap focus. Those
  source assertions are still worth keeping, and both specifications still make
  them; they just cannot be the only evidence for a criterion about what
  happens rather than what is declared.
- **Accept the gap and test by hand.** Rejected because the keyboard path is the
  part most likely to regress silently, being the part nobody looks at.

## Consequences

- `npm run test:interaction` needs `npx playwright install chromium`. The smoke
  project still does not, so CI can keep running it on its own.
- Contrast and token checks stay in the unit specification, which needs neither a
  build nor a browser. Only behaviour that requires a rendered page belongs here.
