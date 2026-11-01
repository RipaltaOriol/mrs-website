import { getTranslations } from 'next-intl/server'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'
import { formatAddress, OFFICES } from '@/lib/offices'
import { EnvelopeIcon, TelephoneIcon } from './icons'

const contactLink = 'text-lg text-ink underline decoration-mist decoration-1 underline-offset-4 hover:decoration-brand'

/** The firm's telephone numbers and email address, then both Offices with address and map link. */
export default async function Offices() {
  const t = await getTranslations('home')
  const common = await getTranslations('common')

  return (
    <div className="mx-auto mt-10 mb-5 max-w-content">
      <ul className="flex flex-col gap-4 border-y border-mist py-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10">
        {TELEPHONES.map((telephone) => (
          <li key={telephone} className="flex items-center gap-3">
            <TelephoneIcon size={14} className="shrink-0 text-brand" />
            <a href={telephoneHref(telephone)} className={contactLink}>
              {formatTelephone(telephone)}
            </a>
          </li>
        ))}
        <li className="flex items-center gap-3">
          <EnvelopeIcon size={14} className="shrink-0 text-brand" />
          <a href={`mailto:${EMAIL}`} className={`${contactLink} break-all`}>
            {EMAIL}
          </a>
        </li>
      </ul>

      <div className="grid gap-x-10 md:grid-cols-2">
        {OFFICES.map((office) => (
          <article key={office.name} className="flex h-full flex-col border-b border-mist py-8">
            <h3 className="mb-2 text-2xl">{office.name}</h3>
            <p className="max-w-measure text-sm text-pretty text-stone">{t(office.descriptionKey)}</p>
            <address className="mb-4 max-w-measure not-italic">{formatAddress(office)}</address>
            <a
              href={office.map}
              aria-label={common('viewOnMapAt', { office: office.name })}
              className="mt-auto w-fit font-medium text-brand underline underline-offset-4 hover:text-brand-deep"
            >
              {common('viewOnMap')}
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
