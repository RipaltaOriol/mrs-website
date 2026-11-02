import { anchorId } from '@/lib/anchor'
import PageTitle from './PageTitle'

export type LongFormSection = { heading: string; body: string }

/** A titled long-form page set in the reading column, with navigable sections. */
export default function LongForm({
  title,
  contentsLabel,
  sections,
}: {
  title: string
  contentsLabel: string
  sections: LongFormSection[]
}) {
  const anchored = sections.map((section) => ({ ...section, id: anchorId(section.heading) }))

  return (
    <div className="mx-auto max-w-content px-5 py-14 md:py-20">
      <div className="lg:grid lg:grid-cols-[var(--container-contents)_minmax(0,var(--container-measure))] lg:justify-center lg:gap-x-14">
        <PageTitle title={title} className="lg:col-start-2 lg:mx-0" />

        <nav
          aria-label={contentsLabel}
          className="mx-auto mb-12 max-w-measure border-y border-mist py-5 lg:sticky lg:top-8 lg:col-start-1 lg:row-start-2 lg:mx-0 lg:mb-0 lg:self-start lg:border-y-0 lg:border-l-2 lg:border-l-rose lg:py-1 lg:pl-5"
        >
          <p className="mb-3 text-sm font-semibold tracking-wide text-stone uppercase">{contentsLabel}</p>
          <ol className="space-y-2 text-sm">
            {anchored.map(({ id, heading }) => (
              <li key={id}>
                <a href={`#${id}`} className="text-ink underline-offset-4 hover:text-brand hover:underline">
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="mx-auto max-w-measure motion-safe:animate-fade-in lg:col-start-2 lg:row-start-2 lg:mx-0">
          {anchored.map(({ id, heading, body }) => (
            <section key={id} id={id} className="mb-12 scroll-mt-8 last:mb-0">
              <h2 className="mb-4 text-2xl text-brand">
                <a href={`#${id}`} className="underline-offset-4 hover:underline">
                  {heading}
                </a>
              </h2>
              <p className="mb-0 text-pretty">{body}</p>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
