import { expect, test, type APIRequestContext } from '@playwright/test'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'
import { formatAddress, OFFICES } from '@/lib/offices'
import caHome from '@/locales/ca/home.json'
import esHome from '@/locales/es/home.json'
import { anchors, headedBlocks, sectionLabelledBy } from './html'

const PATHS = [
  { path: '/', messages: caHome },
  { path: '/es', messages: esHome },
]

for (const { path, messages } of PATHS) {
  test.describe(`the Offices section on ${path}`, () => {
    const offices = async (request: APIRequestContext) =>
      sectionLabelledBy(await (await request.get(path)).text(), 'contact-heading')

    test('states both Office addresses', async ({ request }) => {
      const markup = await offices(request)
      expect(markup).not.toBe('')
      for (const office of OFFICES) expect(markup).toContain(formatAddress(office))
    })

    test('names each Office in its Locale', async ({ request }) => {
      const headings = headedBlocks(await offices(request)).map(({ heading }) => heading)
      expect(headings).toEqual(OFFICES.map((office) => messages[office.nameKey]))
    })

    test('offers every telephone number as a dialable link', async ({ request }) => {
      const dialable = anchors(await offices(request)).filter(({ href }) => href.startsWith('tel:'))
      expect(dialable.map(({ href, text }) => ({ href, text }))).toEqual(
        TELEPHONES.map(({ number }) => ({
          href: telephoneHref(number),
          text: formatTelephone(number),
        })),
      )
    })

    test('offers the email address in one tap', async ({ request }) => {
      const mail = anchors(await offices(request)).filter(({ href }) => href.startsWith('mailto:'))
      expect(mail.map(({ href }) => href)).toEqual([`mailto:${EMAIL}`])
      expect(mail[0].text).toBe(EMAIL)
    })

    test('links each Office out to a map application, naming which Office', async ({ request }) => {
      const maps = anchors(await offices(request)).filter(({ href }) =>
        OFFICES.some((office) => office.map === href),
      )
      expect(maps.map(({ href }) => href)).toEqual(OFFICES.map((office) => office.map))

      for (const [index, office] of OFFICES.entries()) {
        const { text, label } = maps[index]
        const name = messages[office.nameKey]
        expect(label, name).toContain(name)
        // WCAG 2.5.3: speaking the visible label has to activate the link.
        expect(label, name).toContain(text)
      }
    })
  })
}
