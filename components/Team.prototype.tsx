import type { Partner } from '@/lib/content'

/** PROTOTYPE: four takes on Partner biography sizing in the Team section, switched by `?variant=`. */
export const TEAM_BIO_VARIANTS = ['A', 'B', 'E', 'F', 'G', 'H'] as const

export const TEAM_BIO_VARIANT_NAMES: Record<string, string> = {
  A: 'Current',
  B: 'Quiet ruled list',
  C: 'Credentials paragraph',
  D: 'Partners as columns',
  E: 'Stacked, spacing only',
  F: 'Stacked, dotted rules',
  G: 'Stacked, rose side rule',
  H: 'Stacked, rose dash markers',
}

type Props = { partners: Partner[] }

function splitEmail(biography: string[]) {
  const email = biography.find((line) => /^e-?mail:/i.test(line))?.replace(/^e-?mail:\s*/i, '')
  return { email, lines: biography.filter((line) => !/^e-?mail:/i.test(line)) }
}

function EmailLink({ email }: { email?: string }) {
  if (!email) return null
  return (
    <a href={`mailto:${email}`} className="text-sm break-all text-brand underline hover:text-brand-deep">
      {email}
    </a>
  )
}

function Current({ partners }: Props) {
  return (
    <div className="border-t border-mist">
      {partners.map(({ name, role, biography }) => (
        <article
          key={name}
          className="grid gap-x-10 gap-y-4 border-b border-mist py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:py-10"
        >
          <header>
            <h3 className="mb-1 text-2xl">{name}</h3>
            <p className="mb-0 text-sm font-medium tracking-widest text-brand uppercase">{role}</p>
          </header>
          <ul className="max-w-measure">
            {biography.map((line) => (
              <li key={line} className="border-t border-mist py-2 text-pretty first:border-t-0 first:pt-0">
                {line}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

function QuietRuledList({ partners }: Props) {
  return (
    <div className="border-t border-mist">
      {partners.map(({ name, role, biography }) => {
        const { email, lines } = splitEmail(biography)
        return (
          <article
            key={name}
            className="grid gap-x-10 gap-y-4 border-b border-mist py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:py-10"
          >
            <header>
              <h3 className="mb-1 text-2xl">{name}</h3>
              <p className="mb-3 text-sm font-medium tracking-widest text-brand uppercase">{role}</p>
              <EmailLink email={email} />
            </header>
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {lines.map((line) => (
                <li key={line} className="border-t border-mist py-2 text-sm text-pretty text-stone">
                  {line}
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}

function CredentialsParagraph({ partners }: Props) {
  return (
    <div className="border-t border-mist">
      {partners.map(({ name, role, biography }) => {
        const { email, lines } = splitEmail(biography)
        return (
          <article
            key={name}
            className="grid gap-x-10 gap-y-3 border-b border-mist py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-baseline"
          >
            <header>
              <h3 className="mb-1 text-2xl">{name}</h3>
              <p className="mb-0 text-sm font-medium tracking-widest text-brand uppercase">{role}</p>
            </header>
            <div className="max-w-measure">
              <p className="mb-3 text-sm text-pretty text-stone">
                {lines.map((line, index) => (
                  <span key={line}>
                    {index > 0 && <span aria-hidden className="mx-2 text-rose">·</span>}
                    {line}
                  </span>
                ))}
              </p>
              <EmailLink email={email} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function PartnersAsColumns({ partners }: Props) {
  return (
    <div className="grid gap-x-10 gap-y-12 border-t border-mist pt-8 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map(({ name, role, biography }) => {
        const { email, lines } = splitEmail(biography)
        return (
          <article key={name} className="flex flex-col">
            <p className="mb-2 text-sm font-medium tracking-widest text-brand uppercase">{role}</p>
            <h3 className="mb-4 border-b border-ink pb-2 text-xl">{name}</h3>
            <ul className="mb-4">
              {lines.map((line) => (
                <li key={line} className="flex gap-3 py-1 text-sm text-pretty text-stone">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-rose" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <EmailLink email={email} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

const stackedLines: Record<string, { list: string; item: string; marker?: boolean }> = {
  E: { list: 'max-w-measure space-y-2', item: 'text-sm text-pretty text-stone' },
  F: {
    list: 'max-w-measure',
    item: 'border-t border-dotted border-stone/40 py-2 text-sm text-pretty text-stone first:border-t-0 first:pt-0',
  },
  G: { list: 'max-w-measure space-y-2 border-l-2 border-rose pl-5', item: 'text-sm text-pretty text-stone' },
  H: { list: 'max-w-measure space-y-2', item: 'flex gap-3 text-sm text-pretty text-stone', marker: true },
}

function Stacked({ partners, variant }: Props & { variant: string }) {
  const style = stackedLines[variant]
  return (
    <div className="border-t border-mist">
      {partners.map(({ name, role, biography }) => {
        const { email, lines } = splitEmail(biography)
        return (
          <article
            key={name}
            className="grid gap-x-10 gap-y-4 border-b border-mist py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:py-10"
          >
            <header>
              <h3 className="mb-1 text-2xl">{name}</h3>
              <p className="mb-3 text-sm font-medium tracking-widest text-brand uppercase">{role}</p>
              <EmailLink email={email} />
            </header>
            <ul className={style.list}>
              {lines.map((line) => (
                <li key={line} className={style.item}>
                  {style.marker && <span aria-hidden className="mt-[0.75em] h-px w-3 shrink-0 bg-rose" />}
                  {line}
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}

/** PROTOTYPE: renders the Partner block for the chosen variant key. */
export function TeamPartnersVariant({ variant, partners }: Props & { variant: string }) {
  if (variant === 'B') return <QuietRuledList partners={partners} />
  if (variant === 'C') return <CredentialsParagraph partners={partners} />
  if (variant === 'D') return <PartnersAsColumns partners={partners} />
  if (variant in stackedLines) return <Stacked partners={partners} variant={variant} />
  return <Current partners={partners} />
}
