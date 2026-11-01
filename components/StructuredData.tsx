import type { JsonLd } from '@/lib/structured-data'

/** A JSON-LD document, escaped so its text cannot close the script element. */
export default function StructuredData({ data }: { data: JsonLd }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
