import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

// The locale JSON files carried over unchanged; each file is one namespace.
const NAMESPACES = ['common', 'home', 'about', 'blog', 'policy'] as const

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const entries = await Promise.all(
    NAMESPACES.map(async (ns) => [ns, (await import(`../locales/${locale}/${ns}.json`)).default]),
  )

  return { locale, messages: Object.fromEntries(entries) }
})
