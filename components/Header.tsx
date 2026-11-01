import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import HeaderShell from './HeaderShell'
import SiteNav from './SiteNav'

export default async function Header() {
  const t = await getTranslations('common')

  const links = [
    { href: '/about', label: t('firm') },
    { href: '/#work', label: t('work') },
    { href: '/#team', label: t('team') },
    { href: '/#contact', label: t('contact') },
    { href: '/blogs', label: t('blog') },
  ]

  return (
    <HeaderShell>
      <nav
        aria-label="MRS Assessors"
        className="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-3"
      >
        <Link href="/" aria-label={t('home')} className="shrink-0">
          <Image src="/logo.png" alt="MRS Assessors" width={56} height={56} priority />
        </Link>
        <SiteNav
          links={links}
          labels={{
            menu: t('menu'),
            closeMenu: t('closeMenu'),
            portal: t('portal'),
            portalAction: t('portalAction'),
          }}
        />
      </nav>
    </HeaderShell>
  )
}
