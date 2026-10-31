import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import LocaleSwitcher from './LocaleSwitcher'
import MobileNavToggle from './MobileNavToggle'
import { BriefcaseIcon, PersonIcon } from './icons'

const PORTAL_URL = 'https://app.kabiku.es/login/?next=/'

export default async function Header() {
  const t = await getTranslations('common')

  const links = [
    { href: '/about', label: 'La Firma' },
    { href: '/#work', label: t('work') },
    { href: '/#team', label: t('team') },
    { href: '/#contact', label: t('contact') },
    { href: '/blogs', label: t('blog') },
  ]

  const portals = [
    { label: t('employeePortal'), Icon: PersonIcon },
    { label: t('clientsPortal'), Icon: BriefcaseIcon },
  ]

  return (
    <header className="bg-brand">
      <nav className="mx-auto flex max-w-content flex-wrap items-center justify-between px-3">
        <Link href="/" className="py-1">
          <Image src="/logo.png" alt="MRS Assessors" width={75} height={75} priority />
        </Link>
        <MobileNavToggle label="Menu">
          <ul className="block lg:me-auto lg:flex lg:items-center">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="mt-2.5 mr-2.5 block px-2 py-2 text-lg text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mb-3 flex items-center justify-center lg:mb-0">
            <div className="flex items-center border-r-2 border-white pr-5">
              {portals.map(({ label, Icon }) => (
                <a
                  key={label}
                  href={PORTAL_URL}
                  aria-label={label}
                  className="me-2 flex items-center gap-2 text-white"
                >
                  <span className="rounded-full p-1.5 hover:bg-white hover:text-brand">
                    <Icon size={30} />
                  </span>
                  <span className="hidden 2xl:block">{label}</span>
                </a>
              ))}
            </div>
            <LocaleSwitcher />
          </div>
        </MobileNavToggle>
      </nav>
    </header>
  )
}
