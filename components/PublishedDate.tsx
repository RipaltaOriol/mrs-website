import type { Locale } from '@/i18n/routing'
import { machineDate, publicationDate } from '@/lib/published'

/** When an Article was published, readable and machine-readable. */
export default function PublishedDate({
  date,
  locale,
  className = '',
}: {
  date: Date
  locale: Locale
  className?: string
}) {
  return (
    <time dateTime={machineDate(date)} className={`text-sm text-stone ${className}`}>
      {publicationDate(date, locale)}
    </time>
  )
}
