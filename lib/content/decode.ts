import type { Document } from '@contentful/rich-text-types'
import type { ContentEntry, ContentSource } from './source'

/** An image from the content system, ready for `next/image`. */
export type ContentImage = {
  url: string
  width: number
  height: number
  alt: string
}

/**
 * A content response the site cannot render. Thrown, never caught: the build
 * stops with the content type, the entry and the field named, instead of a
 * `TypeError` from somewhere deep inside a page.
 */
export class ContentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ContentError'
  }
}

/**
 * Reads fields off one entry. Every read is checked, so no page ever reaches
 * into a content response and finds `undefined` two properties down.
 */
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

  /**
   * A resolved Asset link, flattened. An unresolved link — which is what the
   * Delivery API sends for an asset that was unpublished or deleted — reads as
   * a missing image rather than as `undefined` four properties down.
   */
  image(field: string): ContentImage {
    const value = this.present(field)
    const file = (value as { fields?: { file?: unknown; title?: unknown } }).fields?.file
    const size = (file as { details?: { image?: unknown } })?.details?.image
    const url = (file as { url?: unknown })?.url
    const { width, height } = (size ?? {}) as { width?: unknown; height?: unknown }

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

  /**
   * A rich text document, checked only as far as the renderer needs: a document
   * node with content. Validating every node type would duplicate the schema.
   */
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

/**
 * Every entry of `contentType`, as checked readers.
 *
 * An empty collection is a failure, not an absence of content: the Delivery API
 * answers an unknown content type, a revoked token's accessible scope or a
 * wiped environment with exactly this, and the site has content of all three
 * types. A Locale holding none of them is a different matter, and the callers
 * that filter by Locale decide that for themselves.
 */
export async function requireEntries(
  source: ContentSource,
  contentType: string,
): Promise<Fields[]> {
  const entries = await source.entries(contentType)
  if (entries.length === 0) {
    throw new ContentError(`${contentType}: the content system returned no entries`)
  }
  return entries.map((entry) => new Fields(contentType, entry))
}
