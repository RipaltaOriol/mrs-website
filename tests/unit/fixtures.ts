import type { ContentEntry, ContentSource } from '@/lib/content/source'

/**
 * A ContentSource over literal entries, standing in for the Delivery API.
 * Field shapes here are copied from live responses, deep links included.
 */
export function sourceOf(entries: Record<string, ContentEntry[]>): ContentSource {
  return { entries: async (contentType) => entries[contentType] ?? [] }
}

export const EMPLOYEE_ENTRIES: ContentEntry[] = [
  {
    id: '4KtCPNBMFdO6Ihj0qiVHzK',
    fields: {
      name: 'Silvia Fullà Soms',
      role_cat: 'Administrativa',
      role_es: 'Administrativa',
      department_cat: 'Departament Fiscal i Comptable',
      department_es: 'Departamento Fiscal y Contable',
      email: 'fiscal@mrsassessors.com',
    },
  },
  {
    id: '2tLdvqN0hWrhpeFmoULTkJ',
    fields: {
      name: 'Maica Rodriguez Sanchez',
      role_cat: 'Administrativa',
      role_es: 'Administrativa',
      department_cat: 'Departament Laboral',
      department_es: 'Departamento Laboral',
      email: 'laboral@mrsassessors.com',
    },
  },
]

/** A resolved Asset link, as the Delivery API nests it. */
function asset(id: string, fileName: string, title: string) {
  return {
    sys: { id, type: 'Asset' },
    fields: {
      title,
      file: {
        url: `//images.ctfassets.net/6io9seow9u0c/${id}/ccacf6753aded7185b3fb1edf986de16/${fileName}`,
        details: { size: 296185, image: { width: 1920, height: 1282 } },
        fileName,
        contentType: 'image/jpeg',
      },
    },
  }
}

const RICH_TEXT = {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', data: {}, marks: [], value: 'El TS declara no haber lugar.' }],
    },
  ],
}

export const ARTICLE_ENTRIES: ContentEntry[] = [
  {
    id: '6CZFHcyNy7Fo8DoYirQWJm',
    fields: {
      title: "Dissolució matrimonial procedeix l'exempció per reinversió",
      slug: 'dissolucio-matrimonial-procedeix-lexempcio-per-reinversio-en-habitatge',
      language: 'ca',
      tags: ['Reinversión Vivienda habitual', 'Disolución Matrimonial'],
      textPreview: 'TS Sentencia num. 553/2023 de 5 mayo',
      thumbnail: asset('2RagCrIYMu0DMeBzhi1UFo', 'img3.jpg', 'img3'),
      featureImage: asset('61bRTDTaRY5OyRbhe8LTAG', 'img1.jpg', 'img1'),
      method: RICH_TEXT,
    },
  },
  {
    id: '3hBeBktPIBmIEhzrO3xZxu',
    fields: {
      title: 'Disolución matrimonial procede la exención por reinversión',
      slug: 'disolucion-matrimonial-procede-la-exencion-por-reinversion-en-vivienda',
      language: 'es',
      tags: ['Reinversión Vivienda habitual'],
      textPreview: 'TS Sentencia num. 553/2023 de 5 mayo',
      thumbnail: asset('2RagCrIYMu0DMeBzhi1UFo', 'img3.jpg', 'img3'),
      featureImage: asset('61bRTDTaRY5OyRbhe8LTAG', 'img1.jpg', 'img1'),
      method: RICH_TEXT,
    },
  },
]
