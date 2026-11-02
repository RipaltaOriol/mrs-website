import { expect, test } from '@playwright/test'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'

const numbers = TELEPHONES.map(({ number }) => number)

test('the firm publishes a mobile, a landline and one email address', () => {
  expect(TELEPHONES).toEqual([
    { number: '618630099', kind: 'mobile' },
    { number: '972371821', kind: 'landline' },
  ])
  expect(EMAIL).toBe('administracio@mrsassessors.com')
})

test('a telephone number dials in international form', () => {
  expect(numbers.map(telephoneHref)).toEqual(['tel:+34618630099', 'tel:+34972371821'])
})

test('a telephone number reads in the grouping it is written in locally', () => {
  expect(numbers.map(formatTelephone)).toEqual(['618 63 00 99', '972 37 18 21'])
})
