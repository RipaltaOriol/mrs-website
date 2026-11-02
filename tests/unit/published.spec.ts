import { expect, test } from '@playwright/test'
import { machineDate, publicationDate } from '@/lib/published'

const LATE_EVENING_UTC = new Date('2023-06-14T22:30:11.482Z')

test('a publication date reads as a long date in Catalan', () => {
  expect(publicationDate(LATE_EVENING_UTC, 'ca')).toBe('15 de juny del 2023')
})

test('a publication date reads as a long date in Spanish', () => {
  expect(publicationDate(LATE_EVENING_UTC, 'es')).toBe('15 de junio de 2023')
})

test('a publication date falls on the day it was in Lloret de Mar, not in UTC', () => {
  expect(publicationDate(new Date('2023-12-31T23:15:00Z'), 'es')).toBe('1 de enero de 2024')
})

test('a publication date is machine-readable as the same calendar day', () => {
  expect(machineDate(LATE_EVENING_UTC)).toBe('2023-06-15')
})
