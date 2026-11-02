import { expect, test } from '@playwright/test'
import { bottomBorderAlpha, controlsIn, tabThrough } from './focus'
import { overflowOf } from './layout'

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 900 }
const FOLDED_PHONE = { width: 280, height: 653 }
const TABLET = { width: 768, height: 1024 }

test.describe('the header hairline', () => {
  test.use({ viewport: DESKTOP })

  test('is absent at the top of the page and appears once scrolled', async ({ page }) => {
    await page.goto('/policy')
    const header = page.getByRole('banner')

    await expect(header).toHaveAttribute('data-scrolled', 'false')
    expect(await bottomBorderAlpha(header)).toBe(0)

    await page.evaluate(() => window.scrollTo(0, 600))
    await expect(header).toHaveAttribute('data-scrolled', 'true')
    expect(await bottomBorderAlpha(header)).toBe(1)

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(header).toHaveAttribute('data-scrolled', 'false')
    expect(await bottomBorderAlpha(header)).toBe(0)
  })
})

test.describe('the mobile navigation', () => {
  test.use({ viewport: PHONE })

  const toggle = (page: import('@playwright/test').Page) =>
    page.locator('button[aria-controls="site-navigation"]')
  const panel = (page: import('@playwright/test').Page) => page.locator('#site-navigation')

  test('opens over the whole viewport', async ({ page }) => {
    await page.goto('/')
    await expect(panel(page)).toBeHidden()

    await toggle(page).click()
    await expect(panel(page)).toBeVisible()
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true')
    expect(await panel(page).boundingBox()).toMatchObject({ x: 0, y: 0, ...PHONE })
  })

  test('opens from the keyboard and moves focus into itself', async ({ page }) => {
    await page.goto('/')
    await toggle(page).focus()
    await page.keyboard.press('Enter')

    await expect(panel(page)).toBeVisible()
    expect(await panel(page).locator(':focus').count()).toBe(1)
  })

  test('closes on Escape and hands focus back to the toggle', async ({ page }) => {
    await page.goto('/')
    await toggle(page).click()
    await expect(panel(page)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(panel(page)).toBeHidden()
    await expect(toggle(page)).toBeFocused()
  })

  test('keeps Tab inside itself while it is open', async ({ page }) => {
    await page.goto('/')
    await toggle(page).click()
    await expect(panel(page)).toBeVisible()

    const inside = await controlsIn(panel(page))
    expect(inside.length).toBeGreaterThan(1)

    const stops = await tabThrough(page, inside.length * 2)
    expect(new Set(stops.map((stop) => stop.control))).toEqual(new Set(inside))
  })

  test('gives every control it holds a visible focus ring', async ({ page }) => {
    await page.goto('/about')
    await toggle(page).click()
    await expect(panel(page)).toBeVisible()

    const inside = await controlsIn(panel(page))
    const stops = await tabThrough(page, inside.length)
    expect(stops.length).toBe(inside.length)
    for (const stop of stops) expect(stop.ringIsVisible, stop.control).toBe(true)
  })

  test('closes when a destination is chosen', async ({ page }) => {
    await page.goto('/')
    await toggle(page).click()
    await panel(page).getByRole('link', { name: 'Notícies' }).click()

    await expect(page).toHaveURL(/\/blogs$/)
    await expect(panel(page)).toBeHidden()
  })
})

const LANDMARKS = { header: 'banner', footer: 'contentinfo' } as const

for (const [region, viewport] of [
  ['header', DESKTOP],
  ['header', PHONE],
  ['footer', DESKTOP],
  ['footer', PHONE],
] as const) {
  test.describe(`every control in the ${region} at ${viewport.width}px`, () => {
    test.use({ viewport })

    test('is reachable by keyboard with a visible focus ring', async ({ page }) => {
      await page.goto('/about')
      const controls = await controlsIn(page.getByRole(LANDMARKS[region]))
      expect(controls.length).toBeGreaterThan(1)

      const stops = await tabThrough(page, 60)
      for (const control of controls) {
        const stop = stops.find((visited) => visited.control === control)
        expect(stop, `${control} is not in the tab order`).toBeDefined()
        expect(stop!.ringIsVisible, `${control} has no visible focus ring`).toBe(true)
      }
    })
  })
}

for (const viewport of [FOLDED_PHONE, PHONE, TABLET, DESKTOP]) {
  test.describe(`the header and footer at ${viewport.width}px`, () => {
    test.use({ viewport })

    for (const path of ['/policy', '/es/policy']) {
      test(`fit the viewport on ${path} without scrolling sideways`, async ({ page }) => {
        await page.goto(path)
        expect(await overflowOf(page.locator('html'))).toBe(0)
      })
    }
  })
}
