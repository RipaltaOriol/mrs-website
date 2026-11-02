export type Violation = { line: number; reason: string; text: string }

type CommentLine = { line: number; text: string }
type Comment = { jsdoc: boolean; lines: CommentLine[]; start: number; end: number; trailing: boolean }

const CHECKED = /\.(ts|tsx|js|jsx|mjs|cjs)$/
const IGNORED = /(^|\/)(node_modules|\.next)\/|(^|\/)next-env\.d\.ts$/

const BANNED: Array<[RegExp, string]> = [
  [/\b(came from|used to|previously|formerly|originally|no longer|retired|legacy)\b/i, 'narrates history'],
  [
    /\b(deliberately|intentionally|on purpose|rather than|instead of|because|the reason|that's why|this is why)\b|,\s*not\b/i,
    'justifies a choice',
  ],
  [
    /\b(workaround|work around|hack|hacky|for some reason|doesn'?t work|does not work|not working|unclear why|no idea why)\b/i,
    'excuses behaviour',
  ],
  [/\b(todo|fixme|xxx)\b|\badr-?\d+|(^|\s)#\d+\b|\bticket\b/i, 'belongs in the issue tracker or an ADR'],
]

export const isChecked = (path: string) => CHECKED.test(path) && !IGNORED.test(path)

function skipQuoted(src: string, i: number, quote: string): number {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') j++
    else if (src[j] === quote) return j + 1
    else if (src[j] === '\n' && quote !== '`') return j
  }
  return src.length
}

function blockLines(body: string, startLine: number): CommentLine[] {
  return body
    .split('\n')
    .map((raw, offset) => ({
      line: startLine + offset,
      text: raw
        .replace(/^\s*\/\*\*?/, '')
        .replace(/\*\/\s*$/, '')
        .replace(/^\s*\*(?!\/)/, '')
        .trim(),
    }))
    .filter((l) => l.text !== '')
}

function scan(src: string): Comment[] {
  const comments: Comment[] = []
  let line = 1
  let lineStart = 0
  let i = 0
  const countLines = (from: number, to: number) => {
    for (let k = from; k < to; k++) {
      if (src[k] === '\n') {
        line++
        lineStart = k + 1
      }
    }
  }
  while (i < src.length) {
    const c = src[i]
    if (c === '"' || c === "'" || c === '`') {
      const next = skipQuoted(src, i, c)
      countLines(i, next)
      i = next
    } else if (c === '/' && src[i + 1] === '/') {
      const end = src.indexOf('\n', i) === -1 ? src.length : src.indexOf('\n', i)
      const trailing = src.slice(lineStart, i).trim() !== ''
      const text = src.slice(i + 2, end).trim()
      comments.push({ jsdoc: false, lines: text ? [{ line, text }] : [], start: line, end: line, trailing })
      i = end
    } else if (c === '/' && src[i + 1] === '*') {
      const close = src.indexOf('*/', i + 2)
      const end = close === -1 ? src.length : close + 2
      const body = src.slice(i, end)
      const jsdoc = body.startsWith('/**') && body !== '/**/'
      const trailing = src.slice(lineStart, i).trim() !== ''
      const start = line
      countLines(i, end)
      comments.push({ jsdoc, lines: blockLines(body, start), start, end: line, trailing })
      i = end
    } else {
      countLines(i, i + 1)
      i++
    }
  }
  return comments
}

function group(comments: Comment[]): Comment[] {
  const groups: Comment[] = []
  for (const c of comments) {
    const last = groups[groups.length - 1]
    const isLineComment = !c.jsdoc && c.start === c.end && !c.trailing
    if (last && isLineComment && !last.jsdoc && !last.trailing && last.end === c.start - 1) {
      last.lines.push(...c.lines)
      last.end = c.end
    } else {
      groups.push({ ...c, lines: [...c.lines] })
    }
  }
  return groups
}

export function findViolations(src: string, added: Set<number>): Violation[] {
  const violations: Violation[] = []
  for (const g of group(scan(src))) {
    const touched = g.lines.filter((l) => added.has(l.line))
    if (touched.length === 0) continue
    const limit = g.jsdoc ? 1 : 2
    if (g.lines.length > limit) {
      violations.push({
        line: g.start,
        reason: `${g.jsdoc ? 'JSDoc' : 'comment'} is ${g.lines.length} lines; the limit is ${limit}`,
        text: g.lines[0].text,
      })
    }
    for (const l of touched) {
      const hit = BANNED.find(([pattern]) => pattern.test(l.text))
      if (hit) violations.push({ line: l.line, reason: hit[1], text: l.text })
    }
  }
  return violations
}

export function addedLinesFromDiff(diff: string): Set<number> {
  const added = new Set<number>()
  for (const m of diff.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(m[1])
    const count = m[2] === undefined ? 1 : Number(m[2])
    for (let n = start; n < start + count; n++) added.add(n)
  }
  return added
}
