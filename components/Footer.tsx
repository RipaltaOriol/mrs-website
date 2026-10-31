import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { EnvelopeIcon, ShieldLockIcon, TelephoneIcon } from './icons'

export default async function Footer() {
  const t = await getTranslations('common')

  return (
    <footer className="bg-brand pt-7.5 text-white">
      <div className="mx-auto grid max-w-content gap-6 px-3 md:grid-cols-2">
        <div>
          <h5>MRS Assessors</h5>
          <p>{t('footerText')}</p>
        </div>
        <div>
          <h5>{t('footerContact')}</h5>
          <ul className="mb-4 space-y-1">
            {['972371821', '972372240'].map((phone) => (
              <li key={phone} className="flex items-center gap-2.5">
                <TelephoneIcon size={12} />
                {phone}
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <EnvelopeIcon size={12} />
              administracio@mrsassessors.com
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldLockIcon size={12} />
              <Link href="/policy" className="text-white hover:underline">
                {t('privacyPolicy')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="pb-5 text-center">© 2020 Copyright: mrsassessors.com</div>
    </footer>
  )
}
