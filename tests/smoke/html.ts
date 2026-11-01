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

/** The `id` of every `<section>`, in document order. */
export function sectionIds(html: string): string[] {
  return tags(html, 'section').map((tag) => tag.id)
}

/** The `href` of every anchor inside the `<nav>` labelled `label`. */
export function navLinks(html: string, label: string): string[] {
  const start = html.search(new RegExp(`<nav\\b[^>]*aria-label="${label}"`))
  if (start < 0) return []
  return tags(html.slice(start, html.indexOf('</nav>', start)), 'a').map((anchor) => anchor.href)
}

/** The markup inside the first `<article>`. */
export function articleBody(html: string): { className: string; inner: string } | undefined {
  const [article] = tags(html, 'article')
  if (!article) return undefined
  const open = html.indexOf('>', html.indexOf('<article')) + 1
  return { className: article.class ?? '', inner: html.slice(open, html.indexOf('</article>', open)) }
}

/** The `href` of every `<link rel="stylesheet">`. */
export function stylesheets(html: string): string[] {
  return tags(html, 'link')
    .filter((tag) => tag.rel === 'stylesheet')
    .map((tag) => tag.href)
}

/** The markup inside the first `<header>`, `<main>` or `<footer>`. */
export function region(html: string, name: 'header' | 'main' | 'footer'): string {
  const start = html.indexOf(`<${name}`)
  if (start < 0) return ''
  const open = html.indexOf('>', start) + 1
  return html.slice(open, html.indexOf(`</${name}>`, open))
}

/** Every tag in `html` whose `class` applies one of `utilities` with no variant prefix. */
export function styledBy(html: string, utilities: string[]): Attrs[] {
  const resting = new RegExp(`(?:^|\\s)(?:${utilities.join('|')})(?:\\s|$)`)
  return [...html.matchAll(/<\w+\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => resting.test(tag.match(/class="([^"]*)"/)?.[1] ?? ''))
    .flatMap((tag) => tags(tag, '\\w+'))
}
