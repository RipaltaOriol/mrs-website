import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const LOGO = 'public/logo.png'
const BRAND = '#99032e'

/** The logo centred on a brand-red square of `size` pixels. */
function square(size) {
  return sharp(LOGO)
    .resize(size, size, { fit: 'contain', background: BRAND })
    .flatten({ background: BRAND })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** An ICO file holding each PNG in `images` as one entry. */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)])
}

const favicon = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await square(size) })))
await mkdir('public/icons', { recursive: true })
await Promise.all([
  writeFile('app/favicon.ico', ico(favicon)),
  writeFile('app/icon.png', await square(512)),
  writeFile('app/apple-icon.png', await square(180)),
  writeFile('public/icons/icon-192.png', await square(192)),
  writeFile('public/icons/icon-512.png', await square(512)),
])
