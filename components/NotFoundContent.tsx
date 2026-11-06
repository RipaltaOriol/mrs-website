import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

const DESTINATIONS = [
  { href: '/about', key: 'firm' },
  { href: '/blogs', key: 'blog' },
  { href: '/#contact', key: 'contact' },
] as const

export default async function NotFoundContent() {
  const t = await getTranslations('notFound')
  const common = await getTranslations('common')

  return (
    <div className="mx-auto flex max-w-content flex-col items-center px-5 py-28 text-center motion-safe:animate-fade-in">
      <p aria-hidden="true" className="mb-0 font-display text-[clamp(6rem,4rem+8vw,11rem)] leading-none text-mist">
        404
      </p>
      <h1 className="mt-4 text-ink sm:-mt-4">{t('heading')}</h1>
      <p className="mt-4 max-w-measure text-pretty text-stone">{t('body')}</p>
      <Link href="/" className="btn mt-4 px-5 py-2.5">
        {t('home')}
      </Link>

      <nav aria-label={t('alsoVisit')} className="mt-10 border-t border-mist pt-6 text-sm">
        <span className="block text-stone sm:inline">{t('alsoVisit')}: </span>
        {DESTINATIONS.map(({ href, key }, i) => (
          <span key={href}>
            {i > 0 && (
              <span aria-hidden="true" className="mx-2.5 inline-block size-1 rounded-full bg-rose align-middle" />
            )}
            <Link href={href} className="whitespace-nowrap text-brand underline-offset-4 hover:underline">
              {common(key)}
            </Link>
          </span>
        ))}
      </nav>
    </div>
  )
}
