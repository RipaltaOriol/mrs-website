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

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/** The visible text of `markup`, tags removed and character references decoded. */
export function visibleText(markup: string): string {
  return markup
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&(\w+);/g, (_, name) => NAMED_ENTITIES[name] ?? ' ')
    .trim()
}

/** The opening tag and contents of the first treated image frame. */
export function treatedFrame(html: string): { frame: string; inner: string } | undefined {
  const start = html.search(/<div\b[^>]*class="[^"]*\btreated\b/)
  if (start < 0) return undefined
  const open = html.indexOf('>', start) + 1
  return { frame: html.slice(start, open), inner: html.slice(open, html.indexOf('</div>', open)) }
}

/** Every disclosure row: the trigger inside its heading, and the panel that follows. */
export function disclosures(html: string): Array<{
  label: string
  expanded: boolean
  controls: string
  panelId: string
  hidden: boolean
  panel: string
}> {
  const headings = [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)]
  return headings.flatMap((heading, index) => {
    const [trigger] = tags(heading[1], 'button')
    if (!trigger) return []
    const start = (heading.index ?? 0) + heading[0].length
    const panel = html.slice(start, headings[index + 1]?.index ?? html.length)
    const [frame] = tags(panel, 'div')
    return [
      {
        label: visibleText(heading[1]),
        expanded: trigger['aria-expanded'] === 'true',
        controls: trigger['aria-controls'] ?? '',
        panelId: frame?.id ?? '',
        hidden: frame?.hidden !== undefined,
        panel,
      },
    ]
  })
}

/** The markup inside the `<section>` labelled by the element with `id`. */
export function sectionLabelledBy(html: string, id: string): string {
  const start = html.search(new RegExp(`<section\\b[^>]*\\baria-labelledby="${id}"`))
  if (start < 0) return ''
  const open = html.indexOf('>', start) + 1
  return html.slice(open, html.indexOf('</section>', open))
}

/** Every `<h3>` and the markup that runs from it to the next `<h3>`. */
export function headedBlocks(html: string): Array<{ heading: string; body: string }> {
  const headings = [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)]
  return headings.map((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length
    return {
      heading: visibleText(heading[1]),
      body: html.slice(start, headings[index + 1]?.index ?? html.length),
    }
  })
}

/** Every anchor as its `href`, its visible text and its `aria-label`. */
export function anchors(html: string): Array<{ href: string; text: string; label?: string }> {
  const decode = (value: string) => value.replaceAll('&amp;', '&')
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].flatMap(([, attributes, inner]) => {
    const href = attributes.match(/\bhref="([^"]*)"/)?.[1]
    if (href === undefined) return []
    const label = attributes.match(/\baria-label="([^"]*)"/)?.[1]
    return [{ href: decode(href), text: visibleText(inner), label: label && decode(label) }]
  })
}

/** The text of `<title>`, character references decoded. */
export function documentTitle(html: string): string | undefined {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/)?.[1]
  return title === undefined ? undefined : visibleText(title)
}

/** The `content` of the `<meta>` whose `property` or `name` is `key`, decoded. */
export function metaContent(html: string, key: string): string | undefined {
  const tag = tags(html, 'meta').find((meta) => meta.property === key || meta.name === key)
  return tag?.content === undefined ? undefined : visibleText(tag.content)
}

/** Every `<script type="application/ld+json">`, parsed. */
export function structuredData(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    ([, json]) => JSON.parse(json),
  )
}

/** The `href` of every `<link>` whose `rel` is `rel`. */
export function linkHrefs(html: string, rel: string): string[] {
  return tags(html, 'link')
    .filter((tag) => tag.rel === rel)
    .map((tag) => tag.href)
}
