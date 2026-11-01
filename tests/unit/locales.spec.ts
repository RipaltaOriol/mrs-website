import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { NAMESPACES } from '@/i18n/namespaces'
import { routing } from '@/i18n/routing'

const messages = (locale: string, namespace: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(process.cwd(), `locales/${locale}/${namespace}.json`), 'utf8'))

/** Every value a message tree bottoms out in, by the path that reaches it. */
function leaves(value: unknown, path: string): Array<[string, unknown]> {
  if (Array.isArray(value)) return value.flatMap((item, at) => leaves(item, `${path}[${at}]`))
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, `${path}.${key}`))
  }
  return [[path, value]]
}

for (const namespace of NAMESPACES) {
  test(`${namespace} carries the same keys in every Locale`, () => {
    const [reference, ...rest] = routing.locales.map((locale) => Object.keys(messages(locale, namespace)).sort())
    for (const keys of rest) expect(keys).toEqual(reference)
  })
}

test('every message is a non-empty string', () => {
  for (const locale of routing.locales) {
    for (const namespace of NAMESPACES) {
      for (const [path, value] of leaves(messages(locale, namespace), namespace)) {
        expect(typeof value, `${locale}/${path}`).toBe('string')
        expect(String(value).trim(), `${locale}/${path}`).not.toBe('')
      }
    }
  }
})

const practiceAreasOf = (locale: string) =>
  messages(locale, 'home').practiceAreas as Array<Record<string, unknown>>

test('every Locale describes the same Practice Areas with the same fields', () => {
  const [reference, ...rest] = routing.locales.map((locale) =>
    practiceAreasOf(locale).map((area) => Object.keys(area).sort()),
  )
  for (const shape of rest) expect(shape).toEqual(reference)
})

const LIST_DELIMITER = '&&'

test('the Practice Areas hold their lists as arrays, not delimiter-separated strings', () => {
  for (const locale of routing.locales) {
    const { practiceAreas } = messages(locale, 'home')
    expect(Array.isArray(practiceAreas), `${locale}/home.practiceAreas`).toBe(true)
    for (const [path, value] of leaves(practiceAreas, 'home.practiceAreas')) {
      expect(String(value), `${locale}/${path}`).not.toContain(LIST_DELIMITER)
    }
  }
})

const PROMISES_A_REDIRECT = /redirect|redirigi/i

test('the 404 page promises no redirect in either Locale', () => {
  for (const locale of routing.locales) {
    for (const [key, value] of Object.entries(messages(locale, 'notFound'))) {
      expect(value, `${locale}/notFound.${key}`).not.toMatch(PROMISES_A_REDIRECT)
    }
  }
})
