/** A long-form page's title over its rose rule, set to the reading measure. */
export default function PageTitle({ title, className = '' }: { title: string; className?: string }) {
  return (
    <header className={`mx-auto mb-10 max-w-measure motion-safe:animate-fade-in lg:mb-14 ${className}`}>
      <h1 className="mb-0 text-ink">{title}</h1>
      <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-rose" />
    </header>
  )
}
