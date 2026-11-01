import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { expect, test } from '@playwright/test'
import { appliedRules, contrast, keyframes, roseUsedAsText, sourceFiles, STYLESHEET, themeTokens } from './theme'

const tokens = themeTokens()
const colour = (name: string) => {
  const value = tokens[`--color-${name}`]
  expect(value, `--color-${name} is not a token`).toMatch(/^#[0-9a-f]{6}$/i)
  return value
}

test('the contrast measure agrees with known WCAG ratios', () => {
  expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
  expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
})

test('the palette holds the logo red and dusty rose', () => {
  expect(colour('brand')).toBe('#99032e')
  expect(colour('rose')).toBe('#d59c98')
})

const BODY = 4.5

const PAIRINGS: Array<[text: string, surface: string, minimum: number]> = [
  ['ink', 'canvas', BODY],
  ['ink', 'white', BODY],
  ['stone', 'canvas', BODY],
  ['stone', 'white', BODY],
  ['brand', 'canvas', BODY],
  ['brand', 'white', BODY],
  ['brand-deep', 'canvas', BODY],
  ['white', 'brand', BODY],
  ['white', 'brand-deep', BODY],
  ['brand', 'mist', BODY],
  ['white', 'ink', BODY],
  ['mist', 'ink', BODY],
]

for (const [text, surface, minimum] of PAIRINGS) {
  test(`${text} on ${surface} meets ${minimum}:1`, () => {
    expect(contrast(colour(text), colour(surface))).toBeGreaterThanOrEqual(minimum)
  })
}

test('the dusty rose is never used as text', () => {
  const offenders = sourceFiles()
    .filter((file) => roseUsedAsText(readFileSync(file, 'utf8')))
    .map((file) => relative(process.cwd(), file))
  expect(offenders).toEqual([])
})

test('the rose check recognises rose used as text', () => {
  expect(roseUsedAsText('<p className="md:text-rose">')).toBe(true)
  expect(roseUsedAsText('a { color: var(--color-rose); }')).toBe(true)
  expect(roseUsedAsText('<hr className="border-rose" />')).toBe(false)
  expect(roseUsedAsText('a { background-color: var(--color-rose); }')).toBe(false)
})

test('every step of the type scale is fluid between a rem floor and a rem ceiling', () => {
  const steps = Object.entries(tokens).filter(([name]) => /^--text-[\w]+$/.test(name))
  expect(steps.length).toBeGreaterThan(4)
  for (const [name, value] of steps) {
    expect(value, name).toMatch(/^clamp\([\d.]+rem,\s*[\d.]+rem \+ [\d.]+vw,\s*[\d.]+rem\)$/)
  }
})

// Inter sets the policy's Catalan prose at 0.505em per character on average, measured in Chromium.
const INTER_EM_PER_CHARACTER = 0.505

test('the reading measure is between 65 and 70 characters of Inter prose', () => {
  const [, ems] = tokens['--container-measure']?.match(/^([\d.]+)em$/) ?? []
  const characters = Number(ems) / INTER_EM_PER_CHARACTER
  expect(characters).toBeGreaterThanOrEqual(65)
  expect(characters).toBeLessThanOrEqual(70)
})

test('the only animation is a short entry fade', () => {
  const animations = Object.entries(tokens).filter(([name]) => name.startsWith('--animate-'))
  expect(animations.map(([name]) => name)).toEqual(['--animate-*', '--animate-fade-in'])
  expect(tokens['--animate-*']).toBe('initial')
  const [, ms] = tokens['--animate-fade-in'].match(/^fade-in (\d+)ms ease-out both$/) ?? []
  expect(Number(ms)).toBeGreaterThan(0)
  expect(Number(ms)).toBeLessThanOrEqual(400)
  expect(keyframes('fade-in')).toEqual(['from{opacity:0}', 'to{opacity:1}'])
})

test('a reduced-motion preference suppresses all animation and transition', () => {
  const block = STYLESHEET.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {0,2}\}/)?.[1] ?? ''
  const compact = block.replace(/\s+/g, '')
  expect(compact).toContain('*,*::before,*::after{')
  expect(compact).toContain('animation:none!important;')
  expect(compact).toContain('transition:none!important;')
  expect(compact).toContain('scroll-behavior:auto!important;')
})

test('the focus ring is drawn in the brand red', () => {
  const base = appliedRules().find((rule) => rule.selector === ':focus-visible')
  expect(base?.utilities).toEqual(['outline-2', 'outline-offset-2', 'outline-brand'])
})

test('only the charcoal footer overrides the focus ring to white', () => {
  const white = appliedRules().filter((rule) => rule.utilities.includes('outline-white'))
  expect(white.map((rule) => rule.selector)).toEqual(['footer :focus-visible'])
})
