import { getTranslations } from 'next-intl/server'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'
import { formatAddress, OFFICES } from '@/lib/offices'
import { EnvelopeIcon, MobilePhoneIcon, TelephoneIcon } from './icons'

const contactIcon = { size: 14, className: 'shrink-0 text-brand' }

const contactLink = 'underline decoration-mist decoration-1 underline-offset-4 hover:decoration-brand'

/** The Contact heading, telephone numbers and email beside both Offices with address and map link. */
export default async function Offices() {
  const t = await getTranslations('home')
  const common = await getTranslations('common')

  return (
    <div className="mx-auto mb-14 grid max-w-content gap-x-10 gap-y-8 border-y border-mist py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <h2 id="contact-heading" className="mb-5 text-2xl">
          {common('contact')}
        </h2>
        <ul className="space-y-2">
          {TELEPHONES.map(({ number, kind }) => (
            <li key={number} className="flex items-center gap-3">
              {kind === 'mobile' ? <MobilePhoneIcon {...contactIcon} /> : <TelephoneIcon {...contactIcon} />}
              <a href={telephoneHref(number)} className={contactLink}>
                {formatTelephone(number)}
              </a>
            </li>
          ))}
          <li className="flex items-center gap-3">
            <EnvelopeIcon {...contactIcon} />
            <a href={`mailto:${EMAIL}`} className={`${contactLink} break-all`}>
              {EMAIL}
            </a>
          </li>
        </ul>
      </div>

      <div>
        {OFFICES.map((office) => (
          <article
            key={office.name}
            className="grid gap-x-6 gap-y-1 border-t border-dotted border-stone/40 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
          >
            <div>
              <h3 className="mb-1 text-lg">{t(office.name)}</h3>
              <p className="mb-1 text-sm text-pretty text-stone">{t(office.descriptionKey)}</p>
              <address className="text-sm not-italic">{formatAddress(office)}</address>
            </div>
            <a
              href={office.map}
              aria-label={common('viewOnMapAt', { office: t(office.name) })}
              className="w-fit text-sm font-medium text-brand underline underline-offset-4 hover:text-brand-deep"
            >
              {common('viewOnMap')}
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
