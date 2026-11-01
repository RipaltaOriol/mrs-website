import { expect, test, type Locator, type Page } from '@playwright/test'
import { getPartners } from '@/lib/content'

const team = (page: Page) => page.locator('section[aria-labelledby="team-heading"]')

const columnsOf = async (blocks: Locator) => {
  const lefts = await blocks.evaluateAll((elements) => elements.map((el) => Math.round(el.getBoundingClientRect().x)))
  return new Set(lefts).size
}

const besideEachOther = async (partner: Locator) => {
  const name = await partner.locator('h3').boundingBox()
  const biography = await partner.locator('ul').boundingBox()
  return biography!.x >= name!.x + name!.width && biography!.y < name!.y + name!.height
}

test.describe('the Team section on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('stacks every block into one column without overflowing', async ({ page }) => {
    await page.goto('/')
    const overflow = await team(page).evaluate((section) => section.scrollWidth - section.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)

    for (const partner of await team(page).locator('article').all()) {
      expect(await besideEachOther(partner)).toBe(false)
    }
    expect(await columnsOf(team(page).locator('div:has(> h3)'))).toBe(1)
  })
})

test.describe('the Team section on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('sets each biography beside its Partner and spreads the Departments across columns', async ({ page }) => {
    await page.goto('/')
    const partners = await team(page).locator('article').all()
    expect(partners.length).toBe(getPartners('ca').length)
    for (const partner of partners) {
      expect(await besideEachOther(partner)).toBe(true)
    }

    const departments = team(page).locator('div:has(> h3)')
    expect(await departments.count()).toBeGreaterThan(1)
    expect(await columnsOf(departments)).toBeGreaterThan(1)
  })
})
