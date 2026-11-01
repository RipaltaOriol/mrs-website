import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

const DESTINATIONS = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'firm' },
  { href: '/blogs', key: 'blog' },
  { href: '/#contact', key: 'contact' },
] as const

export default async function NotFoundContent() {
  const t = await getTranslations('notFound')
  const common = await getTranslations('common')

  return (
    <div className="mx-auto max-w-content px-5 py-20">
      <div className="mx-auto max-w-measure motion-safe:animate-fade-in">
        <p className="mb-2 font-display text-4xl text-stone">404</p>
        <h1 className="mb-0 text-ink">{t('heading')}</h1>
        <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-rose" />
        <p className="mt-8 text-pretty">{t('body')}</p>

        <nav aria-label={t('destinations')}>
          <h2 className="mb-4 font-sans text-sm font-semibold tracking-wide text-stone uppercase">
            {t('destinations')}
          </h2>
          <ul className="space-y-2">
            {DESTINATIONS.map(({ href, key }) => (
              <li key={href}>
                <Link href={href} className="text-brand underline-offset-4 hover:underline">
                  {common(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
