// PROTOTYPE, wipe me: posterises site photographs into co2.is-style two-tone abstracts.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const OUT = 'assets/imagery/_prototype'
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

const JOBS = [
  { name: 'cove-brand', src: 'assets/imagery/costa-brava-cove.jpg', crop: null, threshold: 110, dark: '#99032e', light: '#f7f3f0' },
  { name: 'cove-rose', src: 'assets/imagery/costa-brava-cove.jpg', crop: { left: 300, top: 350, width: 1700, height: 1100 }, threshold: 105, dark: '#99032e', light: '#d59c98' },
  { name: 'cove-stone', src: 'assets/imagery/costa-brava-cove.jpg', crop: { left: 900, top: 300, width: 1100, height: 1250 }, threshold: 115, dark: '#6d615c', light: '#f7f3f0' },
]

await mkdir(OUT, { recursive: true })
for (const job of JOBS) {
  let img = sharp(job.src)
  if (job.crop) img = img.extract(job.crop)
  const { data, info } = await img.grayscale().blur(1.2).raw().toBuffer({ resolveWithObject: true })
  const dark = hex(job.dark)
  const light = hex(job.light)
  const rgb = Buffer.alloc(info.width * info.height * 3)
  for (let i = 0; i < data.length; i++) rgb.set(data[i] < job.threshold ? dark : light, i * 3)
  await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
    .png({ palette: true, colours: 2 })
    .toFile(`${OUT}/${job.name}.png`)
  console.log(`${OUT}/${job.name}.png ${info.width}x${info.height}`)
}
