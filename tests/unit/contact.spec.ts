import { expect, test } from '@playwright/test'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'

test('the firm publishes two telephone numbers and one email address', () => {
  expect(TELEPHONES).toEqual(['972371821', '972372240'])
  expect(EMAIL).toBe('administracio@mrsassessors.com')
})

test('a telephone number dials in international form', () => {
  expect(TELEPHONES.map(telephoneHref)).toEqual(['tel:+34972371821', 'tel:+34972372240'])
})

test('a telephone number reads in the grouping it is written in locally', () => {
  expect(TELEPHONES.map(formatTelephone)).toEqual(['972 37 18 21', '972 37 22 40'])
})
