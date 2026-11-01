import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'
import { formatAddress, OFFICES } from '@/lib/offices'
import { PORTAL_URL } from '@/lib/portal'
import { EnvelopeIcon, ShieldLockIcon, TelephoneIcon } from './icons'
import LocaleSwitcher from './LocaleSwitcher'

const heading = 'mb-4 font-sans text-sm font-semibold tracking-wide text-mist uppercase'

export default async function Footer() {
  const t = await getTranslations('common')

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-content px-5 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className={heading}>MRS Assessors</h2>
            <p className="max-w-measure text-sm text-mist">{t('footerText')}</p>
            <a href={PORTAL_URL} aria-label={t('portalAction')} className="btn text-sm font-medium">
              {t('portal')}
            </a>
          </div>

          <div>
            <h2 className={heading}>{t('offices')}</h2>
            <ul className="space-y-4 text-sm">
              {OFFICES.map((office) => (
                <li key={office.name}>
                  <address className="not-italic">
                    <span className="block font-medium">{office.name}</span>
                    <span className="block text-mist">{formatAddress(office)}</span>
                  </address>
                  <a
                    href={office.map}
                    aria-label={t('viewOnMapAt', { office: office.name })}
                    className="text-mist underline underline-offset-4 hover:text-white"
                  >
                    {t('viewOnMap')}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={heading}>{t('footerContact')}</h2>
            <ul className="space-y-2 text-sm">
              {TELEPHONES.map((telephone) => (
                <li key={telephone} className="flex items-center gap-2.5">
                  <TelephoneIcon size={12} />
                  <a href={telephoneHref(telephone)} className="hover:underline">
                    {formatTelephone(telephone)}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <EnvelopeIcon size={12} />
                <a href={`mailto:${EMAIL}`} className="hover:underline">
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldLockIcon size={12} />
                <Link href="/policy" className="hover:underline">
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-stone">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-5 py-5 text-sm text-mist">
          <span>© {new Date().getFullYear()} mrsassessors.com</span>
          <LocaleSwitcher tone="dark" />
        </div>
      </div>
    </footer>
  )
}
