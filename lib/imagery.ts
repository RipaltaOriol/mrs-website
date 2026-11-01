import type { Messages } from 'next-intl'
import type { StaticImageData } from 'next/image'
import costaBravaCove from '@/assets/imagery/costa-brava-cove.jpg'
import gironaCloister from '@/assets/imagery/girona-cloister.jpg'
import gironaOnyar from '@/assets/imagery/girona-onyar.jpg'
import lloretCastle from '@/assets/imagery/lloret-castle.jpg'

/** A design photograph and the `common` message key that describes it. */
export type Photograph = {
  src: StaticImageData
  alt: Extract<keyof Messages['common'], `image${string}`>
}

/** The curated design photography, each one statically imported. */
export const IMAGERY = {
  lloretCastle: { src: lloretCastle, alt: 'imageLloretCastle' },
  costaBravaCove: { src: costaBravaCove, alt: 'imageCostaBravaCove' },
  gironaOnyar: { src: gironaOnyar, alt: 'imageGironaOnyar' },
  gironaCloister: { src: gironaCloister, alt: 'imageGironaCloister' },
} as const satisfies Record<string, Photograph>
