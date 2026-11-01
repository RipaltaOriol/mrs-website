import type { Locale } from '@/i18n/routing'

const FIRM_TIME_ZONE = 'Europe/Madrid'

/** `date` as a long calendar date in `locale`, on the firm's clock. */
export function publicationDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: FIRM_TIME_ZONE }).format(date)
}

/** `date` as the `YYYY-MM-DD` a `<time datetime>` carries, on the firm's clock. */
export function machineDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FIRM_TIME_ZONE }).format(date)
}
