import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { block, themeTokens } from './theme'

const tokens = themeTokens()

test('the theme offers only the locked image aspect ratios', () => {
  const ratios = Object.entries(tokens).filter(([name]) => name.startsWith('--aspect-'))
  expect(Object.fromEntries(ratios)).toEqual({
    '--aspect-*': 'initial',
    '--aspect-band': '12 / 5',
    '--aspect-landscape': '3 / 2',
  })
})

const TREATMENT = block('@utility treated') ?? ''

const redOutweighsBlue = (hex: string) => parseInt(hex.slice(1, 3), 16) > parseInt(hex.slice(5, 7), 16)

test('the shared treatment partially desaturates the photograph', () => {
  const [, amount] = TREATMENT.match(/filter:[^;]*saturate\(([\d.]+)\)/) ?? []
  expect(Number(amount)).toBeGreaterThan(0)
  expect(Number(amount)).toBeLessThan(1)
})

test('the shared treatment lays a warm palette tint over the photograph', () => {
  const [, token] = TREATMENT.match(/::after\s*\{[^}]*background(?:-color)?:\s*var\((--color-[\w-]+)\)/) ?? []
  expect(token, 'no tint layer drawn from a palette token').toBeDefined()
  expect(redOutweighsBlue(tokens[token]), token).toBe(true)
  expect(TREATMENT).toMatch(/::after\s*\{[^}]*mix-blend-mode:\s*(multiply|soft-light|color)/)
})

const root = (...path: string[]) => join(process.cwd(), ...path)

test('every design photograph in the repository is statically imported by the imagery catalogue', () => {
  const photographs = readdirSync(root('assets/imagery')).filter((file) => file.endsWith('.jpg'))
  expect(photographs.length).toBeGreaterThanOrEqual(4)
  const catalogue = readFileSync(root('lib/imagery.ts'), 'utf8')
  const imported = [...catalogue.matchAll(/^import \w+ from '@\/assets\/imagery\/([\w-]+\.jpg)'$/gm)].map(([, file]) => file)
  expect(imported.sort()).toEqual(photographs.sort())
})

test('no photograph is served raw from public/', () => {
  const raw = readdirSync(root('public'), { recursive: true, encoding: 'utf8' }).filter((file) => /\.(jpe?g|webp|avif)$/i.test(file))
  expect(raw).toEqual([])
})

test('the carousel arrow assets are gone', () => {
  for (const file of ['left-arrow.svg', 'right-arrow.svg']) expect(existsSync(root('public', file)), file).toBe(false)
})
