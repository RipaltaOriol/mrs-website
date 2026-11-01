import { expect, test } from '@playwright/test'
import { addedLinesFromDiff, findViolations, isChecked } from '@/scripts/comments/rules'

const every = (src: string) => new Set(src.split('\n').map((_, i) => i + 1))
const reasons = (src: string, added = every(src)) => findViolations(src, added).map((v) => v.reason)

test('code without comments passes', () => {
  expect(reasons('const a = 1\nexport default a\n')).toEqual([])
})

test('a one-line JSDoc and a short constraint note pass', () => {
  const src = [
    '/** The `<html>` document every page renders into. */',
    'export const Doc = 1',
    '// Contentful caps a page at 1000 entries.',
    'const limit = 1000',
  ].join('\n')
  expect(reasons(src)).toEqual([])
})

test('a JSDoc of two text lines is too long', () => {
  const src = ['/**', ' * On-demand revalidation.', ' * Contentful posts here.', ' */', 'export {}'].join('\n')
  expect(reasons(src)).toEqual(['JSDoc is 2 lines; the limit is 1'])
})

test('three consecutive line comments form one over-long comment', () => {
  const src = ['// one', '// two', '// three', 'const x = 1'].join('\n')
  expect(reasons(src)).toEqual(['comment is 3 lines; the limit is 2'])
})

test('history, justification, excuses and tracker references are banned', () => {
  expect(reasons('// The image came from the old content type.')).toEqual(['narrates history'])
  expect(reasons('// Left unmatched deliberately.')).toEqual(['justifies a choice'])
  expect(reasons("// It is the page's 404, not metadata's.")).toEqual(['justifies a choice'])
  expect(reasons('// Workaround for the router.')).toEqual(['excuses behaviour'])
  expect(reasons('// TODO: tidy this')).toEqual(['belongs in the issue tracker or an ADR'])
  expect(reasons('// See ADR-0003.')).toEqual(['belongs in the issue tracker or an ADR'])
  expect(reasons('const x = 1 // because the API rounds')).toEqual(['justifies a choice'])
})

test('JSX comments are checked', () => {
  expect(reasons('<div>{/* a hack for Safari */}</div>')).toEqual(['excuses behaviour'])
})

test('comment markers inside strings are ignored', () => {
  expect(reasons("const url = 'https://example.com' // the API host\nconst s = \"/* hack */\"")).toEqual([])
})

test('only comments touching added lines are reported', () => {
  const src = ['// Legacy note one.', '// Legacy note two.', '// Legacy note three.', 'const x = 1', '// fine'].join(
    '\n',
  )
  expect(reasons(src, new Set([4, 5]))).toEqual([])
  expect(reasons(src, new Set([2]))).toEqual(['comment is 3 lines; the limit is 2', 'narrates history'])
})

test('added line numbers are read from a zero-context diff', () => {
  const diff = ['@@ -3,0 +4,2 @@', '+a', '+b', '@@ -10 +12 @@', '-c', '+d', '@@ -20,3 +21,0 @@'].join('\n')
  expect([...addedLinesFromDiff(diff)]).toEqual([4, 5, 12])
})

test('only source files outside build output are checked', () => {
  expect(isChecked('app/page.tsx')).toBe(true)
  expect(isChecked('scripts/check-comments.mjs')).toBe(true)
  expect(isChecked('docs/adr/0001.md')).toBe(false)
  expect(isChecked('.next/types/app.ts')).toBe(false)
  expect(isChecked('next-env.d.ts')).toBe(false)
})
