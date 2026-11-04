import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'
import { PORTAL_URL } from '@/lib/portal'
import { EnvelopeIcon, MobilePhoneIcon, ShieldLockIcon, TelephoneIcon } from './icons'
import LocaleSwitcher from './LocaleSwitcher'

const [mailbox, domain] = EMAIL.split('@')

const heading = 'mb-4 font-sans text-sm font-semibold tracking-wide text-mist uppercase'

export default async function Footer() {
  const t = await getTranslations('common')

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-content px-5 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div>
            <h2 className={heading}>MRS Assessors</h2>
            <p className="max-w-measure text-sm text-mist">{t('footerText')}</p>
            <a href={PORTAL_URL} aria-label={t('portalAction')} className="btn text-sm font-medium">
              {t('portal')}
            </a>
          </div>

          <div>
            <h2 className={heading}>{t('footerContact')}</h2>
            <ul className="space-y-2 text-sm">
              {TELEPHONES.map(({ number, kind }) => (
                <li key={number} className="flex items-center gap-2.5">
                  {kind === 'mobile' ? <MobilePhoneIcon size={12} /> : <TelephoneIcon size={12} />}
                  <a href={telephoneHref(number)} className="hover:underline">
                    {formatTelephone(number)}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <EnvelopeIcon size={12} />
                <a href={`mailto:${EMAIL}`} className="hover:underline">
                  {mailbox}
                  <wbr />@{domain}
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 text-sm md:items-end">
            <p className="mb-0 flex items-center gap-2.5">
              <ShieldLockIcon size={12} />
              <Link href="/policy" className="hover:underline">
                {t('privacyPolicy')}
              </Link>
            </p>
            <LocaleSwitcher tone="dark" />
          </div>
        </div>
      </div>

      <div className="border-t border-stone">
        <p className="mx-auto mb-0 max-w-content px-5 py-5 text-sm text-mist">
          © {new Date().getFullYear()} mrsassessors.com
        </p>
      </div>
    </footer>
  )
}
