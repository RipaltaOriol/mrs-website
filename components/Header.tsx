import Image from 'next/image'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import HeaderShell from './HeaderShell'
import SiteNav from './SiteNav'
import CollapsedNavVariants from './prototype/CollapsedNavVariants'

export default async function Header() {
  const t = await getTranslations('common')

  const links = [
    { href: '/about', label: t('firm') },
    { href: '/#work', label: t('work') },
    { href: '/#team', label: t('team') },
    { href: '/#contact', label: t('contact') },
    { href: '/blogs', label: t('blog') },
  ]

  const labels = {
    menu: t('menu'),
    closeMenu: t('closeMenu'),
    portal: t('portal'),
    portalAction: t('portalAction'),
  }

  const current = (
      <nav
        aria-label="MRS Assessors"
        className="mx-auto flex max-w-content items-center gap-2 px-5 py-3 xs:gap-4 lg:gap-10"
      >
        <Link href="/" aria-label={t('home')} className="shrink-0">
          <Image src="/logo.png" alt="MRS Assessors" width={56} height={56} priority />
        </Link>
        <SiteNav
          links={links}
          labels={labels}
        />
      </nav>
  )

  return (
    <HeaderShell>
      {process.env.NODE_ENV === 'production' ? (
        current
      ) : (
        <Suspense fallback={current}>
          <CollapsedNavVariants current={current} links={links} labels={labels} homeLabel={t('home')} />
        </Suspense>
      )}
    </HeaderShell>
  )
}
