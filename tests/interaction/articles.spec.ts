import { expect, test, type Locator, type Page } from '@playwright/test'
import { columnsOf, overflowOf } from './layout'

const VIEWPORTS = [
  { name: 'phone', viewport: { width: 390, height: 844 } },
  { name: 'tablet', viewport: { width: 820, height: 1180 } },
  { name: 'desktop', viewport: { width: 1280, height: 900 } },
]

const measureOf = (block: Locator) =>
  block.evaluate((el) => ({
    width: el.getBoundingClientRect().width,
    measure:
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--container-measure')) *
      parseFloat(getComputedStyle(el).fontSize),
  }))

const openFirstArticle = async (page: Page, index: string) => {
  await page.goto(index)
  await page.locator('main ol > li h2 a').first().click()
  await expect(page).toHaveURL(new RegExp(`${index}/[^/]+$`))
}

for (const index of ['/blogs', '/es/blogs']) {
  for (const { name, viewport } of VIEWPORTS) {
    test.describe(`${index} on a ${name}`, () => {
      test.use({ viewport })

      test('lists its Articles in a single column within the reading measure', async ({ page }) => {
        await page.goto(index)
        const list = page.locator('main ol')
        const { width, measure } = await measureOf(list)
        expect(width).toBeLessThanOrEqual(measure + 0.5)
        expect(await columnsOf(page.locator('main ol > li'))).toBe(1)
        expect(await overflowOf(page.locator('html'))).toBe(0)
      })

      test('an Article sets its prose in the reading column, under a 3:2 feature image', async ({ page }) => {
        await openFirstArticle(page, index)
        const article = page.locator('main article')
        const { width, measure } = await measureOf(article)
        expect(width).toBeLessThanOrEqual(measure + 0.5)
        expect(width).toBeGreaterThan(Math.min(measure, viewport.width) * 0.8)

        const image = (await page.locator('main .aspect-landscape').boundingBox())!
        const column = (await article.boundingBox())!
        expect(image.x).toBeCloseTo(column.x, 0)
        expect(image.width).toBeCloseTo(column.width, 0)
        expect(image.width / image.height).toBeCloseTo(3 / 2, 1)
        expect(image.y + image.height).toBeLessThanOrEqual(column.y)
        expect(await overflowOf(page.locator('html'))).toBe(0)
      })

      test('an Article leads back to the index', async ({ page }) => {
        await openFirstArticle(page, index)
        await page.locator('main nav a').click()
        await expect(page).toHaveURL(new RegExp(`${index}$`))
      })
    })
  }
}
