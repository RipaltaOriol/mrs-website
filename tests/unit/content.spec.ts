import { expect, test } from '@playwright/test'
import {
  getArticle,
  getArticles,
  getEmployees,
  getPartners,
  getPracticeAreas,
  groupByDepartment,
} from '@/lib/content'
import { ARTICLE_ENTRIES, EMPLOYEE_ENTRIES, sourceOf } from './fixtures'

const source = sourceOf({ employees: EMPLOYEE_ENTRIES })

test('an Employee resolves with the role and Department of the asked-for Locale', async () => {
  const [ca] = await getEmployees('ca', source)
  expect(ca).toEqual({
    name: 'Silvia Fullà Soms',
    role: 'Administrativa',
    department: 'Departament Fiscal i Comptable',
    email: 'fiscal@mrsassessors.com',
  })

  const [es] = await getEmployees('es', source)
  expect(es.department).toBe('Departamento Fiscal y Contable')
})

test('a field missing from an entry names the content type, the entry and the field', async () => {
  const [complete] = EMPLOYEE_ENTRIES
  const incomplete = { ...complete, fields: { ...complete.fields, department_cat: undefined } }

  await expect(getEmployees('ca', sourceOf({ employees: [incomplete] }))).rejects.toThrow(
    'employees 4KtCPNBMFdO6Ihj0qiVHzK: field "department_cat" is missing or empty',
  )
})

test('a field holding the wrong type is rejected rather than coerced', async () => {
  const [complete] = EMPLOYEE_ENTRIES
  const wrong = { ...complete, fields: { ...complete.fields, name: { es: 'Silvia' } } }

  await expect(getEmployees('ca', sourceOf({ employees: [wrong] }))).rejects.toThrow(
    'employees 4KtCPNBMFdO6Ihj0qiVHzK: field "name" is not text',
  )
})

test('a blank field is as bad as an absent one', async () => {
  const [complete] = EMPLOYEE_ENTRIES
  const blank = { ...complete, fields: { ...complete.fields, email: '   ' } }

  await expect(getEmployees('ca', sourceOf({ employees: [blank] }))).rejects.toThrow(
    'field "email" is missing or empty',
  )
})

test('a response with no entries at all fails rather than rendering an empty page', async () => {
  await expect(getEmployees('ca', sourceOf({}))).rejects.toThrow(
    'employees: the content system returned no entries',
  )
})

test('Employees group by Department in the order each Department first appears', () => {
  const employee = (name: string, department: string) => ({
    name,
    role: 'Administrativa',
    department,
    email: `${name.toLowerCase()}@mrsassessors.com`,
  })

  const departments = groupByDepartment([
    employee('Silvia', 'Departament Fiscal i Comptable'),
    employee('Maica', 'Departament Laboral'),
    employee('Laura', 'Departament Fiscal i Comptable'),
  ])

  expect(departments.map(({ name, employees }) => [name, employees.map((e) => e.name)])).toEqual([
    ['Departament Fiscal i Comptable', ['Silvia', 'Laura']],
    ['Departament Laboral', ['Maica']],
  ])
})

const articles = sourceOf({ mrsBlog: ARTICLE_ENTRIES })

test('the Article index holds only the Articles published in that Locale', async () => {
  expect((await getArticles('ca', articles)).map((a) => a.slug)).toEqual([
    'dissolucio-matrimonial-procedeix-lexempcio-per-reinversio-en-habitatge',
  ])
  expect((await getArticles('es', articles)).map((a) => a.slug)).toEqual([
    'disolucion-matrimonial-procede-la-exencion-por-reinversion-en-vivienda',
  ])
})

test('an Article carries its thumbnail as an absolute URL with its intrinsic size', async () => {
  const [article] = await getArticles('ca', articles)
  expect(article.thumbnail).toEqual({
    url: 'https://images.ctfassets.net/6io9seow9u0c/2RagCrIYMu0DMeBzhi1UFo/ccacf6753aded7185b3fb1edf986de16/img3.jpg',
    width: 1920,
    height: 1282,
    alt: 'img3',
  })
  expect(article.tags).toEqual(['Reinversión Vivienda habitual', 'Disolución Matrimonial'])
  expect(article.preview).toBe('TS Sentencia num. 553/2023 de 5 mayo')
})

test('an Article is dated by when it was created in the content system', async () => {
  const [summary] = await getArticles('ca', articles)
  expect(summary.published).toEqual(new Date('2023-06-14T22:30:11.482Z'))

  const article = await getArticle('es', 'disolucion-matrimonial-procede-la-exencion-por-reinversion-en-vivienda', articles)
  expect(article?.published).toEqual(new Date('2023-06-15T08:02:47.105Z'))
})

test('an Article with no readable creation time names the entry', async () => {
  const [ca] = ARTICLE_ENTRIES
  const undated = { ...ca, createdAt: 'not a date' }

  await expect(getArticles('ca', sourceOf({ mrsBlog: [undated] }))).rejects.toThrow(
    'mrsBlog 6CZFHcyNy7Fo8DoYirQWJm: its creation time is not a date',
  )
})

test('an Article whose thumbnail never resolved is reported as that field, not as a TypeError', async () => {
  const [ca] = ARTICLE_ENTRIES
  const broken = { ...ca, fields: { ...ca.fields, thumbnail: { sys: { id: 'x', type: 'Link' } } } }

  await expect(getArticles('ca', sourceOf({ mrsBlog: [broken] }))).rejects.toThrow(
    'mrsBlog 6CZFHcyNy7Fo8DoYirQWJm: field "thumbnail" is not a resolved image',
  )
})

test('an Article resolves by slug with its body and its feature image', async () => {
  const article = await getArticle(
    'ca',
    'dissolucio-matrimonial-procedeix-lexempcio-per-reinversio-en-habitatge',
    articles,
  )
  expect(article?.title).toBe("Dissolució matrimonial procedeix l'exempció per reinversió")
  expect(article?.image.url).toContain('img1.jpg')
  expect(article?.body.nodeType).toBe('document')
})

test('an unknown slug resolves to nothing rather than failing', async () => {
  expect(await getArticle('ca', 'no-such-article', articles)).toBeNull()
})

test("an Article is not reachable under the other Locale's prefix", async () => {
  const spanish = 'disolucion-matrimonial-procede-la-exencion-por-reinversion-en-vivienda'
  expect(await getArticle('ca', spanish, articles)).toBeNull()
  expect(await getArticle('es', spanish, articles)).not.toBeNull()
})

test('an Article with an empty body fails rather than rendering a blank page', async () => {
  const [ca] = ARTICLE_ENTRIES
  const blank = { ...ca, fields: { ...ca.fields, method: { nodeType: 'document', content: [] } } }
  const slug = ca.fields.slug as string

  await expect(getArticle('ca', slug, sourceOf({ mrsBlog: [blank] }))).rejects.toThrow(
    'mrsBlog 6CZFHcyNy7Fo8DoYirQWJm: field "method" is missing or empty',
  )
})

// Partner messages as the committed locale JSON holds them.
const HOME_MESSAGES: Record<string, string> = {
  founder: 'Soci Fundador',
  partner: 'Soci',
  ripaltaBio: 'Llicenciat en Dret&&Màster en Tributació',
  martinezBio: "Llicenciat en Dret&&Diploma d'Estudis Avançats",
  saisBio: 'Llicenciat en Dret per la UNED',
}

test('the three Partners resolve with their role and their biography as lines', async () => {
  const partners = getPartners('ca', HOME_MESSAGES)

  expect(partners.map((p) => p.name)).toEqual([
    'Rafael Joaquín Ripalta Romeo',
    'Sebastián Martínez de Trincheria',
    'Jordi Sais Giralt',
  ])
  expect(partners[0]).toEqual({
    name: 'Rafael Joaquín Ripalta Romeo',
    role: 'Soci Fundador',
    biography: ['Llicenciat en Dret', 'Màster en Tributació'],
  })
  expect(partners[2].role).toBe('Soci')
})

test('a Partner biography absent from the locale file names the key', async () => {
  const { saisBio, ...withoutSais } = HOME_MESSAGES
  expect(() => getPartners('ca', withoutSais)).toThrow('home.json: "saisBio" is missing or empty')

  expect(() => getPartners('ca', { ...HOME_MESSAGES, saisBio: '' })).toThrow(
    'home.json: "saisBio" is missing or empty',
  )
})

// next-intl answers a missing key with the key path, which is not blank.
test('a Partner biography is never the message key standing in for itself', async () => {
  expect(() => getPartners('ca', { ...HOME_MESSAGES, saisBio: 'home.saisBio' })).toThrow(
    'home.json: "saisBio" looks like an unresolved message key',
  )
})

test('both committed locale files resolve every Partner', async () => {
  for (const locale of ['ca', 'es'] as const) {
    const partners = getPartners(locale)
    expect(partners, locale).toHaveLength(3)
    for (const partner of partners) {
      expect(partner.role, `${locale} ${partner.name} role`).not.toBe('')
      expect(partner.biography.length, `${locale} ${partner.name} biography`).toBeGreaterThan(0)
    }
  }
})

const LABORAL = {
  title: ' Laboral ',
  summary: 'Nòmines, contractes i relacions laborals.',
  paragraphs: ['El departament de laboral ofereix un assessorament global.'],
  items: ["Altes inicials d'empreses", ' Obertura de centres de treball '],
}

test('a Practice Area resolves with its title, summary, body and list, trimmed', () => {
  expect(getPracticeAreas('ca', { practiceAreas: [LABORAL] })).toEqual([
    {
      title: 'Laboral',
      summary: 'Nòmines, contractes i relacions laborals.',
      paragraphs: ['El departament de laboral ofereix un assessorament global.'],
      items: ["Altes inicials d'empreses", 'Obertura de centres de treball'],
    },
  ])
})

test('a malformed Practice Area names what is wrong and where', () => {
  const areas = (practiceAreas: unknown[]) => () => getPracticeAreas('ca', { practiceAreas })

  expect(() => getPracticeAreas('ca', {})).toThrow('home.json: "practiceAreas" is missing or empty')
  expect(areas([])).toThrow('home.json: "practiceAreas" is missing or empty')
  expect(areas([{ ...LABORAL, summary: '   ' }])).toThrow(
    'home.json: practiceAreas[0].summary is missing or empty',
  )
  expect(areas([LABORAL, { ...LABORAL, items: 'Altes&&Baixes' }])).toThrow(
    'home.json: practiceAreas[1].items is not a list',
  )
  expect(areas([{ ...LABORAL, items: ['Altes', ''] }])).toThrow(
    'home.json: practiceAreas[0].items holds a blank or non-text item at position 1',
  )
  expect(areas([{ ...LABORAL, items: [] }])).toThrow(
    'home.json: practiceAreas[0].items is missing or empty',
  )
  expect(areas([LABORAL, null])).toThrow('home.json: practiceAreas[1] is not a Practice Area')
})

test('a Practice Area the firm presents as a list alone carries no body', () => {
  const [area] = getPracticeAreas('ca', { practiceAreas: [{ ...LABORAL, paragraphs: [] }] })
  expect(area.paragraphs).toEqual([])
  expect(area.items.length).toBeGreaterThan(0)
})

const CATALAN_TITLES = [
  'Laboral',
  'Fiscal i Tributari',
  'Comptable',
  'Mercantil',
  'Assegurances',
  'Gestió',
  'Jurídic',
  'Immobiliari',
  'Financer',
]

const SPANISH_TITLES = [
  'Laboral',
  'Fiscal y Tributario',
  'Contable',
  'Mercantil',
  'Seguros',
  'Gestión',
  'Jurídico',
  'Inmobiliario',
  'Financiero',
]

test('both committed locale files hold the nine Practice Areas in the same order', () => {
  expect(getPracticeAreas('ca').map((area) => area.title)).toEqual(CATALAN_TITLES)
  expect(getPracticeAreas('es').map((area) => area.title)).toEqual(SPANISH_TITLES)
})

test('every committed Practice Area carries a one-line summary and a list', () => {
  for (const locale of ['ca', 'es'] as const) {
    for (const { title, summary, items } of getPracticeAreas(locale)) {
      const where = `${locale} ${title}`
      expect(summary.split(/\s+/).length, `${where} summary is one line`).toBeLessThanOrEqual(20)
      expect(summary, `${where} summary`).not.toContain('&&')
      expect(items.length, `${where} items`).toBeGreaterThan(1)
    }
  }
})
