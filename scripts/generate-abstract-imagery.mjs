import sharp from 'sharp'

const SOURCE = 'assets/imagery/costa-brava-cove.jpg'
const TARGET = 'assets/imagery/abstract-cove.png'
const THRESHOLD = 110
const DARK = '#99032e'
const LIGHT = '#f7f3f0'

/** The red, green and blue channels of a `#rrggbb` colour. */
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const { data, info } = await sharp(SOURCE).grayscale().blur(1.2).raw().toBuffer({ resolveWithObject: true })
const dark = channels(DARK)
const light = channels(LIGHT)
const pixels = Buffer.alloc(info.width * info.height * 3)
for (let i = 0; i < data.length; i++) pixels.set(data[i] < THRESHOLD ? dark : light, i * 3)

await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 3 } })
  .png({ palette: true, colours: 2, compressionLevel: 9 })
  .toFile(TARGET)
