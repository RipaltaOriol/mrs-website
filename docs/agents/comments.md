# Comments

Code explains itself through names, types and small functions. A comment is the exception.

## Allowed

- A one-line JSDoc on an exported symbol, saying **what** it is: `/** The <html> document every page renders into. */`
- A note of at most two lines on an **outside constraint** the code cannot show: a framework quirk, an external API contract, a unit or format.

## Not allowed

- **History**: what the code used to be, what was retired, where something came from.
- **Justification**: why this approach and not another ("deliberately", "rather than", "instead of", "because", "X, not Y").
- **Excuses**: workarounds, hacks, things that do not work as expected or for unknown reasons. Fix the cause or open an issue.
- **Tracker references**: TODO, FIXME, ticket numbers, ADR numbers.
- **Narration**: restating what the next line does.

## Where that context goes instead

| Context                         | Home                               |
| ------------------------------- | ---------------------------------- |
| A decision and its alternatives | `docs/adr/`                        |
| What a domain term means        | `GLOSSARY.md`                      |
| Why a change was made           | The commit message or PR description |
| Work still to do                | A GitHub issue                     |

## Enforcement

`scripts/check-comments.mjs` checks comments on **added** lines only, so untouched code is never flagged:

- **Claude Code**: a `PostToolUse` hook in `.claude/settings.json` runs it after every edit and returns violations to the agent.
- **Pre-commit**: `.githooks/pre-commit` runs it on staged changes. `npm install` enables it through the `prepare` script.
- **CI**: `.github/workflows/comments.yml` runs it against the pull request's base branch.

The banned phrases and the line limits live in `scripts/comments/rules.ts`. If a phrase flags a legitimate constraint note, reword the note. Do not add an escape hatch.
