import { expect, test, type Page } from '@playwright/test'
import { telephoneHref, TELEPHONES } from '@/lib/contact'
import { OFFICES } from '@/lib/offices'
import { controlsIn, tabThrough } from './focus'
import { columnsOf, overflowOf, rowsOf } from './layout'

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 900 }

const offices = (page: Page) => page.locator('section[aria-labelledby="contact-heading"]')

test.describe('the Offices section on a phone', () => {
  test.use({ viewport: PHONE })

  test('stacks the contact links and both Offices into one column without overflowing', async ({ page }) => {
    await page.goto('/')
    expect(await overflowOf(offices(page))).toBeLessThanOrEqual(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(PHONE.width)

    expect(await columnsOf(offices(page).locator('article'))).toBe(1)
    expect(await rowsOf(offices(page).locator('article'))).toBe(OFFICES.length)
    expect(await columnsOf(offices(page).locator('li'))).toBe(1)
    expect(await rowsOf(offices(page).locator('li'))).toBe(TELEPHONES.length + 1)
  })
})

test.describe('the Offices section on a desktop', () => {
  test.use({ viewport: DESKTOP })

  test('stacks the contact links in a column beside the stacked Offices', async ({ page }) => {
    await page.goto('/')
    const articles = offices(page).locator('article')
    const links = offices(page).locator('li')
    expect(await columnsOf(articles)).toBe(1)
    expect(await rowsOf(articles)).toBe(OFFICES.length)
    expect(await columnsOf(links)).toBe(1)
    expect(await rowsOf(links)).toBe(TELEPHONES.length + 1)

    const linksLeft = (await links.first().boundingBox())!.x
    const articlesLeft = (await articles.first().boundingBox())!.x
    expect(articlesLeft).toBeGreaterThan(linksLeft)
  })
})

test.describe('the contact links', () => {
  test.use({ viewport: PHONE })

  test('dial, write or open a map, and take a visible focus ring in the tab order', async ({ page }) => {
    await page.goto('/')
    const controls = await controlsIn(offices(page))
    for (const { number } of TELEPHONES) expect(controls).toContain(`a ${telephoneHref(number)}`)
    expect(controls.filter((control) => control.startsWith('a mailto:'))).toHaveLength(1)
    for (const office of OFFICES) expect(controls).toContain(`a ${office.map}`)

    const first = offices(page).locator('a[href^="tel:"]').first()
    await first.focus()
    await page.keyboard.press('Shift+Tab')
    const [stop] = await tabThrough(page, 1)
    expect(stop.control).toBe(`a ${telephoneHref(TELEPHONES[0].number)}`)
    expect(stop.ringIsVisible).toBe(true)
  })
})
