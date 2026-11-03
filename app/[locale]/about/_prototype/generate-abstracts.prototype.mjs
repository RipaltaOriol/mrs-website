import sharp from 'sharp'

const dark = [0x99, 0x03, 0x2e]
const light = [0xf7, 0xf3, 0xf0]
const dir = process.argv[2]

for (const [name, threshold] of [['girona-cloister', 105], ['girona-onyar', 115]]) {
  const { data, info } = await sharp(`assets/imagery/${name}.jpg`).grayscale().blur(1.2).raw().toBuffer({ resolveWithObject: true })
  const pixels = Buffer.alloc(info.width * info.height * 3)
  for (let i = 0; i < data.length; i++) pixels.set(data[i] < threshold ? dark : light, i * 3)
  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 3 } })
    .png({ palette: true, colours: 2, compressionLevel: 9 })
    .toFile(`${dir}/abstract-${name}.png`)
}
