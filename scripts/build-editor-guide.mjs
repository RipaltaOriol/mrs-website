import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { chromium } from '@playwright/test'
import { Marked } from 'marked'
import sharp from 'sharp'

const SOURCE = 'docs/editors/guia-contentful.md'
const OUTPUT = 'docs/editors/guia-contentful.pdf'
const STRICT = process.argv.includes('--strict')
const NARROW_PX = 1000

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' }

/** A file as a `data:` URL, so the page loads nothing from disk. */
async function dataUrl(path) {
  const data = await readFile(path)
  return `data:${MIME[extname(path).toLowerCase()]};base64,${data.toString('base64')}`
}

/** The anchor a heading is linked by: its text, unnumbered, lowercased and hyphenated. */
function anchor(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/^\d+\.\s*/, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** The front matter's `key: value` lines and the Markdown after them. */
function splitFrontMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) throw new Error(`${SOURCE}: front matter with a title is required`)
  const meta = Object.fromEntries(
    match[1].split('\n').map((line) => {
      const at = line.indexOf(':')
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
    }),
  )
  return { meta, markdown: source.slice(match[0].length) }
}

const { meta, markdown } = splitFrontMatter(await readFile(SOURCE, 'utf8'))
const headings = []
const missing = []
const images = new Map()

for (const [, src] of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
  const path = join(dirname(SOURCE), src)
  if (existsSync(path)) {
    const { width } = await sharp(path).metadata()
    images.set(src, { url: await dataUrl(path), narrow: width < NARROW_PX })
  }
  else missing.push(src)
}

let chapter = 0
const marked = new Marked({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens)
      const id = anchor(html)
      if (depth === 1) chapter += 1
      if (depth <= 2) headings.push({ depth, id, html, chapter })
      const number = depth === 1 ? `<span class="chapter">${chapter}</span>` : ''
      return `<h${depth} id="${id}">${number}${html}</h${depth}>\n`
    },
    image({ href, text }) {
      const image = images.get(href)
      if (!image) return `<figure class="pending"><span>Captura pendiente</span>${escapeHtml(text)}</figure>`
      return `<figure${image.narrow ? ' class="narrow"' : ''}><img src="${image.url}" alt="${escapeHtml(text)}"><figcaption>${escapeHtml(text)}</figcaption></figure>`
    },
    paragraph({ tokens }) {
      if (tokens.length === 1 && tokens[0].type === 'image') return this.parser.parseInline(tokens)
      return `<p>${this.parser.parseInline(tokens)}</p>\n`
    },
  },
})

const body = marked.parse(markdown)

const ids = new Set(headings.map(({ id }) => id))
for (const [, target] of body.matchAll(/href="#([^"]+)"/g)) {
  const id = decodeURIComponent(target)
  if (!ids.has(id) && !body.includes(`id="${id}"`)) throw new Error(`${SOURCE}: no heading for the link #${id}`)
}

if (missing.length > 0) {
  const list = missing.map((src) => `  ${src}`).join('\n')
  if (STRICT) throw new Error(`${SOURCE}: screenshots missing:\n${list}`)
  console.warn(`Screenshots missing, rendered as placeholders:\n${list}`)
}

const toc = headings
  .map(({ depth, id, html, chapter: n }) =>
    depth === 1
      ? `<li class="toc-chapter"><a href="#${id}"><span>${n}</span>${html}</a></li>`
      : `<li class="toc-section"><a href="#${id}">${html}</a></li>`,
  )
  .join('\n')

const edition = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date())

const [logo, inter, newsreader] = await Promise.all([
  dataUrl('public/logo.svg'),
  dataUrl('assets/fonts/Inter-Medium.ttf'),
  dataUrl('assets/fonts/Newsreader-Medium.ttf'),
])

const css = `
@font-face { font-family: Inter; src: url(${inter}); }
@font-face { font-family: Newsreader; src: url(${newsreader}); }
@page {
  size: A4;
  margin: 22mm 20mm 24mm;
  @bottom-left { content: "MRS Assessors · Guía de Contentful"; font: 8pt Inter, sans-serif; color: #6d615c; }
  @bottom-right { content: counter(page); font: 8pt Inter, sans-serif; color: #6d615c; }
}
@page cover { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 9.5pt/1.6 Inter, sans-serif; font-weight: 400; color: #2a2321; }
a { color: #99032e; text-decoration: none; }
strong { color: #2a2321; font-weight: 700; }
code { font: 8.5pt ui-monospace, Menlo, monospace; background: #f7f3f0; border: 1px solid #e8dfda; border-radius: 3px; padding: 0 3px; }

.cover { page: cover; height: 296mm; overflow: hidden; padding: 34mm 24mm; background: #99032e; color: #fff; display: flex; flex-direction: column; break-after: page; }
.cover img { width: 34mm; padding: 5mm; background: #fff; border-radius: 3px; }
.cover h1 { font: 34pt/1.08 Newsreader, serif; margin: auto 0 8mm; color: #fff; }
.cover p { font-size: 13pt; line-height: 1.45; max-width: 120mm; margin: 0; color: #f7f3f0; }
.cover .edition { margin-top: 18mm; font-size: 9pt; letter-spacing: 0.08em; text-transform: uppercase; color: #d59c98; }

.toc { break-after: page; }
.toc h2 { font: 22pt Newsreader, serif; color: #99032e; margin: 0 0 8mm; border: 0; }
.toc ol { list-style: none; padding: 0; margin: 0; }
.toc-chapter { margin-top: 4mm; font-size: 11pt; }
.toc-chapter a { color: #2a2321; }
.toc-chapter span { display: inline-block; width: 8mm; color: #99032e; }
.toc-section { margin-left: 8mm; color: #6d615c; }
.toc-section a { color: #6d615c; }

h1 { font: 24pt/1.15 Newsreader, serif; color: #2a2321; margin: 0 0 7mm; padding-bottom: 4mm; border-bottom: 2px solid #99032e; break-before: page; }
h1 .chapter { display: block; font: 10pt Inter, sans-serif; letter-spacing: 0.1em; color: #99032e; margin-bottom: 2mm; }
h1 .chapter::before { content: "CAPÍTULO "; }
h2 { font: 15pt/1.25 Newsreader, serif; color: #99032e; margin: 8mm 0 3mm; break-after: avoid; }
h3 { font: 11pt/1.3 Inter, sans-serif; font-weight: 700; margin: 6mm 0 2mm; break-after: avoid; }
p, li { orphans: 3; widows: 3; }
ul, ol { padding-left: 6mm; }
li { margin: 1mm 0; }
li:has(> input[type=checkbox]) { list-style: none; margin-left: -6mm; }
input[type=checkbox] { width: 3.2mm; height: 3.2mm; margin: 0 2mm 0 0; vertical-align: -0.5mm; accent-color: #99032e; }

blockquote { margin: 5mm 0; padding: 3mm 5mm; background: #f7f3f0; border-left: 3px solid #99032e; break-inside: avoid; }
blockquote p { margin: 1.5mm 0; }
blockquote p:first-child strong { display: block; font-size: 8pt; letter-spacing: 0.1em; text-transform: uppercase; color: #99032e; }

table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 8.5pt; break-inside: avoid; }
th, td { text-align: left; padding: 2mm 2.5mm; border-bottom: 1px solid #e8dfda; vertical-align: top; }
th { color: #6d615c; font-weight: 700; border-bottom: 1.5px solid #6d615c; }

figure { margin: 5mm 0; break-inside: avoid; }
figure img { display: block; max-width: 100%; max-height: 110mm; margin: 0 auto; border: 1px solid #e8dfda; border-radius: 4px; }
figure.narrow img { width: 75mm; }
figcaption { margin-top: 2mm; font-size: 8pt; color: #6d615c; text-align: center; }
figure.pending { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 40mm; border: 1.5px dashed #d59c98; border-radius: 4px; color: #6d615c; font-size: 8.5pt; text-align: center; padding: 0 10mm; }
figure.pending span { font-size: 7.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: #99032e; margin-bottom: 1mm; }
`

const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>${escapeHtml(meta.title)}</title><style>${css}</style></head>
<body>
<section class="cover">
  <img src="${logo}" alt="MRS Assessors">
  <h1>${escapeHtml(meta.title)}</h1>
  <p>${escapeHtml(meta.subtitle ?? '')}</p>
  <p class="edition">Edición de ${edition}</p>
</section>
<nav class="toc"><h2>Índice</h2><ol>${toc}</ol></nav>
<main>${body}</main>
</body>
</html>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({ path: OUTPUT, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true })
} finally {
  await browser.close()
}

console.log(`Wrote ${OUTPUT}`)
