/**
 * One published entry, flattened to its id and its fields.
 *
 * "Entry" is Contentful's word for a stored record of any content type, and is
 * used here deliberately even though `GLOSSARY.md` lists it as a word to avoid
 * for an Article. This is the adapter layer, where the content system's own
 * vocabulary is the clearer one; past this boundary there are only Articles,
 * Employees and Partners.
 */
export type ContentEntry = { id: string; createdAt: string; fields: Record<string, unknown> }

/** The site's only window onto the content system, replaceable by a fixture. */
export type ContentSource = {
  /** Every published entry of `contentType`, with links resolved. */
  entries(contentType: string): Promise<ContentEntry[]>
}
