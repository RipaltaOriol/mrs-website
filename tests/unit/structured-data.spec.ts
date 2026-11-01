import { expect, test } from '@playwright/test'
import { articleMarkup, breadcrumbs, firmGraph } from '@/lib/structured-data'

const HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '14:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '16:00',
    closes: '19:00',
  },
]

const offices = (graph: ReturnType<typeof firmGraph>) =>
  (graph['@graph'] as Array<Record<string, unknown>>).filter((node) => node['@type'] === 'LegalService')

test('the firm is published as a LegalService at each of its two Offices', () => {
  const graph = firmGraph('ca')
  expect(graph['@context']).toBe('https://schema.org')
  expect(offices(graph).map((office) => office.address)).toEqual([
    {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Can Guidet, núm. 5 local 1A',
      postalCode: '17310',
      addressLocality: 'Lloret de Mar',
      addressRegion: 'Girona',
      addressCountry: 'ES',
    },
    {
      '@type': 'PostalAddress',
      streetAddress: 'Passeig Jacint Verdaguer, núm. 8',
      postalCode: '17310',
      addressLocality: 'Lloret de Mar',
      addressRegion: 'Girona',
      addressCountry: 'ES',
    },
  ])
})

test('each Office carries its coordinates, the firm’s telephones, the area served and the opening hours', () => {
  const [central, verdaguer] = offices(firmGraph('ca'))
  expect(central.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 41.7061464, longitude: 2.8388331 })
  expect(verdaguer.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 41.6990774, longitude: 2.8484235 })

  for (const office of [central, verdaguer]) {
    expect(office.telephone).toEqual(['+34972371821', '+34972372240'])
    expect(office.email).toBe('administracio@mrsassessors.com')
    expect(office.areaServed).toEqual({ '@type': 'AdministrativeArea', name: 'Girona' })
    expect(office.openingHoursSpecification).toEqual(HOURS)
  }
})

test('each Office belongs to the firm and links to the site in the asked-for Locale', () => {
  const graph = firmGraph('es')
  const nodes = graph['@graph'] as Array<Record<string, unknown>>
  const firm = nodes.find((node) => node['@type'] === 'Organization')

  expect(firm).toMatchObject({
    name: 'MRS Assessors',
    url: 'https://www.mrsassessors.com',
    telephone: ['+34972371821', '+34972372240'],
  })
  for (const office of offices(graph)) {
    expect(office.parentOrganization).toEqual({ '@id': firm!['@id'] })
    expect(office.url).toBe('https://www.mrsassessors.com/es')
  }
})

test('the firm graph survives a JSON round trip unchanged', () => {
  const graph = firmGraph('ca')
  expect(JSON.parse(JSON.stringify(graph))).toEqual(graph)
})

test('an inner page lists its trail from the home page as breadcrumbs', () => {
  expect(
    breadcrumbs(
      [
        { name: 'Inici', page: '/' },
        { name: 'Notícies', page: '/blogs' },
      ],
      'es',
    ),
  ).toEqual({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inici', item: 'https://www.mrsassessors.com/es' },
      { '@type': 'ListItem', position: 2, name: 'Notícies', item: 'https://www.mrsassessors.com/es/blogs' },
    ],
  })
})

test('an Article is marked up with its own headline, date, image and the firm as author', () => {
  const markup = articleMarkup(
    {
      slug: 'nova-llei',
      title: 'La nova llei de l’habitatge',
      published: new Date('2024-03-05T00:00:00.000Z'),
      preview: 'Què canvia per als propietaris.',
      image: { url: '//images.ctfassets.net/x/nova.jpg', width: 1200, height: 800, alt: '' },
    },
    'ca',
  )

  expect(markup).toEqual({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'La nova llei de l’habitatge',
    description: 'Què canvia per als propietaris.',
    datePublished: '2024-03-05T00:00:00.000Z',
    image: 'https://images.ctfassets.net/x/nova.jpg',
    inLanguage: 'ca',
    url: 'https://www.mrsassessors.com/blogs/nova-llei',
    mainEntityOfPage: 'https://www.mrsassessors.com/blogs/nova-llei',
    author: { '@id': 'https://www.mrsassessors.com/#firm' },
    publisher: { '@id': 'https://www.mrsassessors.com/#firm' },
  })
})
