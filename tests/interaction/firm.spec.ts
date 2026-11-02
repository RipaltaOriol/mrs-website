import { expect, test } from '@playwright/test'
import { overflowOf } from './layout'

const VIEWPORTS = [
  { name: 'phone', viewport: { width: 390, height: 844 } },
  { name: 'tablet', viewport: { width: 820, height: 1180 } },
  { name: 'desktop', viewport: { width: 1280, height: 900 } },
]

for (const path of ['/about', '/es/about']) {
  for (const { name, viewport } of VIEWPORTS) {
    test.describe(`The Firm on ${path} on a ${name}`, () => {
      test.use({ viewport })

      test('sets its prose no wider than the reading measure', async ({ page }) => {
        await page.goto(path)
        const article = page.locator('main article')
        const { width, measure } = await article.evaluate((el) => ({
          width: el.getBoundingClientRect().width,
          measure:
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--container-measure')) *
            parseFloat(getComputedStyle(el).fontSize),
        }))
        expect(width).toBeLessThanOrEqual(measure + 0.5)
        expect(width).toBeGreaterThan(Math.min(measure, viewport.width) * 0.8)
      })

      test('aligns the photograph with the column at its locked ratio', async ({ page }) => {
        await page.goto(path)
        const image = (await page.locator('main .treated').boundingBox())!
        const column = (await page.locator('main article').boundingBox())!
        expect(image.x).toBeCloseTo(column.x, 0)
        expect(image.width).toBeCloseTo(column.width, 0)
        expect(image.width / image.height).toBeCloseTo(3 / 2, 1)
        expect(image.y + image.height).toBeLessThanOrEqual(column.y)
      })

      test('does not overflow sideways', async ({ page }) => {
        await page.goto(path)
        expect(await overflowOf(page.locator('html'))).toBe(0)
      })
    })
  }
}
