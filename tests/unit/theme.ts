import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const STYLESHEET = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

/** Every custom property declared in the stylesheet's `@theme` block. */
export function themeTokens(css = STYLESHEET): Record<string, string> {
  const block = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+(?:\*)?)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  )
}

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
}

/** The WCAG 2 contrast ratio between two `#rrggbb` colours. */
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const ROSE_AS_TEXT = /(?<![\w-])(?:[\w-]+:)*(?:text|placeholder|caret)-rose\b|(?<![\w-])color:\s*var\(--color-rose\)/

/** Whether a source text styles any text in the dusty rose. */
export const roseUsedAsText = (source: string) => ROSE_AS_TEXT.test(source)

/** Every stylesheet and component source the site renders from. */
export function sourceFiles(): string[] {
  return ['app', 'components']
    .flatMap((dir) => readdirSync(join(process.cwd(), dir), { recursive: true, encoding: 'utf8' }).map((f) => join(process.cwd(), dir, f)))
    .filter((file) => /\.(tsx?|css)$/.test(file))
}

/** The body of the first stylesheet block opened by `prelude`, or `undefined` if there is none. */
export function block(prelude: string, css = STYLESHEET): string | undefined {
  const rule = css.indexOf(`${prelude} `)
  if (rule < 0) return undefined
  const open = css.indexOf('{', rule)
  let depth = 0
  let close = open
  do {
    if (css[close] === '{') depth++
    if (css[close] === '}') depth--
    close++
  } while (depth > 0 && close < css.length)
  return css.slice(open + 1, close - 1)
}

/** The frames of a stylesheet `@keyframes` rule, whitespace removed. */
export function keyframes(name: string, css = STYLESHEET): string[] {
  const body = block(`@keyframes ${name}`, css)?.replace(/\s+/g, '')
  if (body === undefined) return []
  return [...body.matchAll(/[\w%]+\{[^}]*\}/g)].map(([frame]) => frame.replace(/;\}/, '}'))
}

/** Every `@apply` rule in the stylesheet, as its selector and the utilities it applies. */
export function appliedRules(css = STYLESHEET): Array<{ selector: string; utilities: string[] }> {
  return [...css.matchAll(/([^{}]+)\{\s*@apply ([^;]+);\s*\}/g)].map(([, selector, utilities]) => ({
    selector: selector.trim().replace(/\s*\n\s*/g, ' '),
    utilities: utilities.trim().split(/\s+/),
  }))
}
