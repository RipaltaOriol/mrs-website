// Minimal attribute readers over server-rendered HTML. Deliberately tiny: the
// smoke specification asserts on a handful of tags, not on DOM structure.

type Attrs = Record<string, string>

function tags(html: string, name: string): Attrs[] {
  const found: Attrs[] = []
  for (const [, body] of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))) {
    const attrs: Attrs = {}
    for (const [, key, value] of body.matchAll(/([\w:-]+)="([^"]*)"/g)) {
      attrs[key.toLowerCase()] = value.replaceAll('&amp;', '&')
    }
    found.push(attrs)
  }
  return found
}

export function documentLanguage(html: string): string | undefined {
  return tags(html, 'html')[0]?.lang
}

/** `hreflang` → absolute URL, from `<link rel="alternate">` tags. */
export function hreflangAlternates(html: string): Record<string, string> {
  return Object.fromEntries(
    tags(html, 'link')
      .filter((tag) => tag.rel === 'alternate' && tag.hreflang)
      .map((tag) => [tag.hreflang, tag.href]),
  )
}

/** The `href` of the Locale switcher anchor for `locale`. */
export function localeSwitchHref(html: string, locale: string): string | undefined {
  return tags(html, 'a').find((anchor) => anchor.hreflang === locale)?.href
}

/** The `href` of every anchor whose target starts with `prefix`. */
export function linksUnder(html: string, prefix: string): string[] {
  return tags(html, 'a')
    .map((anchor) => anchor.href)
    .filter((href) => href?.startsWith(prefix))
}

/** The `href` of `<link rel="canonical">`. */
export function canonical(html: string): string | undefined {
  return tags(html, 'link').find((tag) => tag.rel === 'canonical')?.href
}

/** The `src` of every `<img>`. */
export function imageSources(html: string): string[] {
  return tags(html, 'img').map((tag) => tag.src)
}
