import Image from 'next/image'
import coveBrand from '@/assets/imagery/_prototype/cove-brand.png'
import coveRose from '@/assets/imagery/_prototype/cove-rose.png'
import coveStone from '@/assets/imagery/_prototype/cove-stone.png'
import ScrollZoom from './ScrollZoom'

export const VARIANTS = [
  { key: 'A', name: 'abstract band' },
  { key: 'B', name: 'full-bleed abstract' },
  { key: 'C', name: 'split, abstract panel' },
]

type Hero = { statement: string; subline: string; action: string; href: string }

function Statement({ statement, subline, action, href }: Hero) {
  return (
    <>
      <p className="mb-5 text-sm font-medium tracking-widest text-stone uppercase">MRS Assessors</p>
      <h1 id="hero-statement" className="max-w-4xl">
        {statement}
      </h1>
      <p className="mt-5 mb-8 max-w-measure text-lg text-stone">{subline}</p>
      <a href={href} className="btn">
        {action}
      </a>
    </>
  )
}

const HERO_MOTION = `
@keyframes proto-rise { from { opacity: 0; transform: translateY(64px) } to { opacity: 1; transform: none } }
@keyframes proto-settle { from { opacity: 0; transform: scale(1.1) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: no-preference) {
  .proto-rise { animation: proto-rise 900ms cubic-bezier(0.2, 0.7, 0.2, 1) both }
  .proto-settle { animation: proto-settle 1400ms cubic-bezier(0.2, 0.7, 0.2, 1) 150ms both }
}`

export function VariantA(hero: Hero) {
  return (
    <section aria-labelledby="hero-statement" className="flex min-h-[calc(100svh-5rem)] flex-col overflow-hidden">
      <style>{HERO_MOTION}</style>
      <div className="proto-rise mx-auto w-full max-w-content shrink-0 px-5 pt-8 pb-10 md:pt-16 md:pb-14">
        <Statement {...hero} />
      </div>
      <ScrollZoom className="relative min-h-64 flex-1 bg-mist">
        <div className="proto-settle absolute inset-0">
          <Image src={coveBrand} alt="" fill sizes="100vw" priority className="object-cover" />
        </div>
      </ScrollZoom>
    </section>
  )
}

export function VariantB({ statement, subline, action, href }: Hero) {
  return (
    <section aria-labelledby="hero-statement" className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-brand">
      <Image src={coveRose} alt="" fill sizes="100vw" priority className="object-cover" />
      <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-content items-start px-4 pt-4 pb-4 md:items-end md:px-5 md:pt-12 md:pb-20">
        <div className="max-w-3xl bg-brand p-6 text-white md:p-12">
          <p className="mb-5 text-sm font-medium tracking-widest text-rose uppercase">MRS Assessors</p>
          <h1 id="hero-statement">{statement}</h1>
          <p className="mt-5 mb-8 max-w-measure text-lg text-white/85">{subline}</p>
          <a href={href} className="inline-block rounded bg-white px-3 py-1.5 text-brand hover:bg-canvas">
            {action}
          </a>
        </div>
      </div>
    </section>
  )
}

export function VariantC(hero: Hero) {
  return (
    <section aria-labelledby="hero-statement" className="grid min-h-[80svh] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex items-center px-5 py-16 md:py-24 md:pl-[max(1.25rem,calc((100vw-75rem)/2+1.25rem))] md:pr-12">
        <div>
          <Statement {...hero} />
        </div>
      </div>
      <div className="relative min-h-80 bg-mist">
        <Image src={coveStone} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" priority className="object-cover" />
      </div>
    </section>
  )
}
