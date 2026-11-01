import { expect, test } from '@playwright/test'
import { formatAddress, OFFICES } from '@/lib/offices'

test('the firm has two Offices, both in Lloret de Mar', () => {
  expect(OFFICES).toHaveLength(2)
  expect(new Set(OFFICES.map((office) => office.name)).size).toBe(2)
  for (const office of OFFICES) expect(office.town).toBe('Lloret de Mar')
})

const ADDRESS_LINES = [
  'Calle Can Guidet, núm. 5 local 1A. 17310 Lloret de Mar',
  'Passeig Jacint Verdaguer, núm. 8. 17310 Lloret de Mar',
]

test('an Office address composes into the line the contact section renders', () => {
  expect(OFFICES.map(formatAddress)).toEqual(ADDRESS_LINES)
})

test('every Office links out to a map application and embeds none', () => {
  for (const office of OFFICES) {
    expect(office.map, office.name).toMatch(/^https:\/\/goo\.gl\/maps\/\S+$/)
    expect(Object.keys(office), office.name).not.toContain('embed')
    expect(JSON.stringify(office), office.name).not.toContain('maps/embed')
  }
})
