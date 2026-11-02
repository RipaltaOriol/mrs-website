# mrs-website

## Agent skills

### Issue tracker

Issues live as GitHub issues in `RipaltaOriol/mrs-website`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Runbooks

Owner-only operational procedures live in `docs/runbooks/`. Agents cannot action
these; surface the relevant runbook to the repository owner instead.

### Comments

Default to no comment. Never write comments that narrate history, justify a choice, excuse behaviour or reference tickets/ADRs. JSDoc is one line at most. A hook enforces this on every edit. See `docs/agents/comments.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
