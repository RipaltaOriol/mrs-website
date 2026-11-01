import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { addedLinesFromDiff, findViolations, isChecked } from './comments/rules.ts'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 26 })
const allLines = (src) => new Set(src.split('\n').map((_, i) => i + 1))

function tracked(file) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', '--', file], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function fromHook() {
  const input = JSON.parse(readFileSync(0, 'utf8'))
  const path = input.tool_input?.file_path
  if (!path) return []
  const file = relative(git('rev-parse', '--show-toplevel').trim(), path)
  if (file.startsWith('..') || !isChecked(file)) return []
  const src = readFileSync(path, 'utf8')
  const added = tracked(file) ? addedLinesFromDiff(git('diff', '-U0', 'HEAD', '--', file)) : allLines(src)
  return [{ file, src, added }]
}

function fromGit(range, read) {
  return git('diff', '--name-only', '--diff-filter=ACMR', ...range)
    .split('\n')
    .filter((f) => f && isChecked(f))
    .map((file) => ({ file, src: read(file), added: addedLinesFromDiff(git('diff', '-U0', ...range, '--', file)) }))
}

const [mode, base] = process.argv.slice(2)
const files =
  mode === '--hook'
    ? fromHook()
    : mode === '--staged'
      ? fromGit(['--cached'], (f) => git('show', `:${f}`))
      : mode === '--base' && base
        ? fromGit([`${base}...HEAD`], (f) => git('show', `HEAD:${f}`))
        : (console.error('usage: check-comments.mjs --hook | --staged | --base <ref>'), process.exit(64))

const report = files.flatMap(({ file, src, added }) =>
  findViolations(src, added).map((v) => `  ${file}:${v.line} ${v.reason}: "${v.text}"`),
)

if (report.length > 0) {
  console.error(
    [
      'Comment policy violated (docs/agents/comments.md):',
      ...report,
      'Delete the comment, or move the context to an ADR, GLOSSARY.md, the commit message or the PR description.',
      'Keep a comment only if it states an outside constraint the code cannot show, in at most two lines.',
    ].join('\n'),
  )
  process.exit(mode === '--hook' ? 2 : 1)
}
