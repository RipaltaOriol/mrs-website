/** One published entry, flattened to its id and its fields. */
export type ContentEntry = { id: string; createdAt: string; fields: Record<string, unknown> }

/** The site's only window onto the content system, replaceable by a fixture. */
export type ContentSource = {
  /** Every published entry of `contentType`, with links resolved. */
  entries(contentType: string): Promise<ContentEntry[]>
}
