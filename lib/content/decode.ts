import type { Document } from '@contentful/rich-text-types'
import type { ContentEntry, ContentSource } from './source'

/** An image from the content system, ready for `next/image`. */
export type ContentImage = {
  url: string
  width: number
  height: number
  alt: string
}

/** A content response the site cannot render, naming the content type, entry and field. */
export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

/** Checked reads of the fields on one entry. */
export class Fields {
  constructor(
    private readonly contentType: string,
    private readonly entry: ContentEntry,
  ) {}

  private fail(field: string, problem: string): never {
    throw new ContentError(`${this.contentType} ${this.entry.id}: field "${field}" ${problem}`)
  }

  private present(field: string): unknown {
    const value = this.entry.fields[field]
    if (value === undefined || value === null) this.fail(field, 'is missing or empty')
    return value
  }

  /** When the entry was first created in the content system. */
  createdAt(): Date {
    const created = new Date(this.entry.createdAt)
    if (Number.isNaN(created.getTime())) {
      throw new ContentError(`${this.contentType} ${this.entry.id}: its creation time is not a date`)
    }
    return created
  }

  /** A non-blank string. */
  text(field: string): string {
    const value = this.present(field)
    if (typeof value !== 'string') this.fail(field, 'is not text')
    if (value.trim() === '') this.fail(field, 'is missing or empty')
    return value.trim()
  }

  /** An optional non-blank string. */
  optionalText(field: string): string | null {
    const value = this.entry.fields[field]
    if (value === undefined || value === null) return null
    return this.text(field)
  }

  /** An optional list of non-blank strings; an absent list reads as empty. */
  textList(field: string): string[] {
    const value = this.entry.fields[field]
    if (value === undefined || value === null) return []
    if (!Array.isArray(value)) this.fail(field, 'is not a list')
    return value.map((item, index) => {
      if (typeof item !== 'string' || item.trim() === '') {
        this.fail(field, `holds a blank or non-text item at position ${index}`)
      }
      return item.trim()
    })
  }

  /** A resolved Asset link, flattened; an unresolved link reads as a missing image. */
  image(field: string): ContentImage {
    const value = this.present(field)
    const file = (value as { fields?: { file?: unknown; title?: unknown } }).fields?.file
    const size = (file as { details?: { image?: unknown } })?.details?.image
    const url = (file as { url?: unknown })?.url
    const { width, height } = (size ?? {}) as { width?: unknown; height?: unknown }

    // The Delivery API sends an unpublished or deleted asset as an unresolved link.
    if (typeof url !== 'string' || typeof width !== 'number' || typeof height !== 'number') {
      this.fail(field, 'is not a resolved image')
    }

    const title = (value as { fields?: { title?: unknown } }).fields?.title
    return {
      // Asset URLs come back protocol-relative.
      url: url.startsWith('//') ? `https:${url}` : url,
      width,
      height,
      alt: typeof title === 'string' ? title.trim() : '',
    }
  }

  /** A rich text document, checked down to its document node and content. */
  richText(field: string): Document {
    const value = this.present(field)
    const { nodeType, content } = value as { nodeType?: unknown; content?: unknown }
    if (nodeType !== 'document' || !Array.isArray(content)) {
      this.fail(field, 'is not a rich text document')
    }
    if (content.length === 0) this.fail(field, 'is missing or empty')
    return value as Document
  }
}

/** Every entry of `contentType`, as checked readers; an empty collection throws. */
export async function requireEntries(
  source: ContentSource,
  contentType: string,
): Promise<Fields[]> {
  const entries = await source.entries(contentType)
  // The Delivery API answers an unknown content type, an unscoped token and a
  // wiped environment alike with an empty collection.
  if (entries.length === 0) {
    throw new ContentError(`${contentType}: the content system returned no entries`)
  }
  return entries.map((entry) => new Fields(contentType, entry))
}
