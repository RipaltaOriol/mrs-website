// Articles exist independently per Locale, so an Article has no counterpart
// to switch to: the switcher lands on the other Locale's Article index.
/** The path a Locale switch lands on from `pathname`. */
export function counterpartPath(pathname: string): string {
  return pathname.startsWith('/blogs/') ? '/blogs' : pathname
}

/** Each Locale's name in its own language. */
export const ENDONYMS = { ca: 'Català', es: 'Español' } as const
