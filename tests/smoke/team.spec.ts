import { expect, test, type APIRequestContext } from '@playwright/test'
import { getPartners } from '@/lib/content'
import { anchors, headedBlocks, sectionLabelledBy, visibleText as text } from './html'

const TEAM_BY_PATH = {
  '/': { locale: 'ca', department: 'Departament Fiscal i Comptable' },
  '/es': { locale: 'es', department: 'Departamento Fiscal y Contable' },
} as const

for (const [path, { locale, department }] of Object.entries(TEAM_BY_PATH)) {
  test.describe(`the Team section on ${path}`, () => {
    const team = async (request: APIRequestContext) => sectionLabelledBy(await (await request.get(path)).text(), 'team-heading')

    test('carries no photograph or portrait', async ({ request }) => {
      const markup = await team(request)
      expect(markup).not.toBe('')
      expect(markup).not.toMatch(/<(img|picture|svg)\b/)
      expect(markup).not.toContain('background-image')
    })

    test('opens with the Partners in order, each with a role and a full biography', async ({ request }) => {
      const partners = getPartners(locale)
      const blocks = headedBlocks(await team(request)).slice(0, partners.length)

      expect(blocks.map((block) => block.heading)).toEqual(partners.map((partner) => partner.name))
      for (const [index, { role, biography }] of partners.entries()) {
        const body = text(blocks[index].body)
        expect(body, partners[index].name).toContain(role)
        for (const line of biography) expect(body, partners[index].name).toContain(line)
      }
    })

    test('follows with a directory grouped by Department, each Department once', async ({ request }) => {
      const departments = headedBlocks(await team(request)).slice(getPartners(locale).length)
      const names = departments.map((block) => block.heading)

      expect(names).toContain(department)
      expect(new Set(names).size).toBe(names.length)
    })

    test('gives every Employee a working email link', async ({ request }) => {
      const departments = headedBlocks(await team(request)).slice(getPartners(locale).length)
      expect(departments.length).toBeGreaterThan(0)

      for (const { heading, body } of departments) {
        const links = anchors(body)
        expect(links.length, heading).toBeGreaterThan(0)
        for (const { href, text: address } of links) {
          expect(address, heading).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]+$/)
          expect(href, heading).toBe(`mailto:${address}`)
        }
      }
    })
  })
}
