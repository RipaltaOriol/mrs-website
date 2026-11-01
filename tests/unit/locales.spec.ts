import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { NAMESPACES } from '@/i18n/namespaces'
import { routing } from '@/i18n/routing'

const messages = (locale: string, namespace: string): Record<string, string> =>
  JSON.parse(readFileSync(join(process.cwd(), `locales/${locale}/${namespace}.json`), 'utf8'))

for (const namespace of NAMESPACES) {
  test(`${namespace} carries the same keys in every Locale`, () => {
    const [reference, ...rest] = routing.locales.map((locale) => Object.keys(messages(locale, namespace)).sort())
    for (const keys of rest) expect(keys).toEqual(reference)
  })
}

test('every message is a non-empty string', () => {
  for (const locale of routing.locales) {
    for (const namespace of NAMESPACES) {
      for (const [key, value] of Object.entries(messages(locale, namespace))) {
        expect(typeof value, `${locale}/${namespace}.${key}`).toBe('string')
        expect(value.trim(), `${locale}/${namespace}.${key}`).not.toBe('')
      }
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
