import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Photograph } from '@/lib/imagery'

const RATIOS = {
  band: 'aspect-landscape md:aspect-band',
  landscape: 'aspect-landscape',
} as const

type Props = {
  photograph: Photograph
  ratio: keyof typeof RATIOS
  sizes: string
  priority?: boolean
}

/** A design photograph under the shared treatment, cropped to a locked ratio. */
export default async function TreatedImage({ photograph, ratio, sizes, priority }: Props) {
  const t = await getTranslations('common')
  return (
    <div className={`treated ${RATIOS[ratio]}`}>
      <Image
        src={photograph.src}
        alt={t(photograph.alt)}
        placeholder="blur"
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  )
}
