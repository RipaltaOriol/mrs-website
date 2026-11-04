import { getLocale, getTranslations } from 'next-intl/server'
import Divider from '@/components/Divider'
import { EnvelopeIcon, MobilePhoneIcon, TelephoneIcon } from '@/components/icons'
import Offices from '@/components/Offices'
import { EMAIL, formatTelephone, telephoneHref, TELEPHONES } from '@/lib/contact'
import { formatAddress, OFFICES } from '@/lib/offices'

/** PROTOTYPE: the contact-section variants on the home page. */
export const CONTACT_VARIANTS = [
  { key: 'A', name: 'Current' },
  { key: 'B', name: 'Ledger row, slim footer' },
  { key: 'C', name: 'Invitation, footer keeps addresses' },
  { key: 'D', name: 'No section, footer is Contact' },
]

const COPY = {
  ca: { lead: 'Parlem.', sub: 'Truqui’ns o escrigui’ns i us atendrem des de qualsevol de les nostres dues oficines a Lloret de Mar.' },
  es: { lead: 'Hablemos.', sub: 'Llámenos o escríbanos y le atenderemos desde cualquiera de nuestras dos oficinas en Lloret de Mar.' },
} as const

const icon = { size: 14, className: 'shrink-0 text-brand' }

function TelephoneGlyph({ kind }: { kind: string }) {
  return kind === 'mobile' ? <MobilePhoneIcon {...icon} /> : <TelephoneIcon {...icon} />
}

export async function VariantA() {
  const common = await getTranslations('common')
  return (
    <>
      <span id="contact" />
      <Divider />
      <section aria-labelledby="contact-heading" className="mx-7.5">
        <h2 id="contact-heading" className="text-center">
          {common('contact')}
        </h2>
        <Offices />
      </section>
      <Divider />
    </>
  )
}

export async function VariantB() {
  const t = await getTranslations('home')
  const common = await getTranslations('common')
  return (
    <>
      <span id="contact" />
      <Divider />
      <section aria-labelledby="contact-heading" className="mx-7.5">
        <div className="mx-auto mb-14 grid max-w-content gap-x-10 gap-y-8 border-y border-mist py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <h2 id="contact-heading" className="mb-5 text-2xl">
              {common('contact')}
            </h2>
            <ul className="space-y-2">
              {TELEPHONES.map(({ number, kind }) => (
                <li key={number} className="flex items-center gap-3">
                  <TelephoneGlyph kind={kind} />
                  <a href={telephoneHref(number)} className="underline decoration-mist underline-offset-4 hover:decoration-brand">
                    {formatTelephone(number)}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <EnvelopeIcon {...icon} />
                <a href={`mailto:${EMAIL}`} className="break-all underline decoration-mist underline-offset-4 hover:decoration-brand">
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
          <ul>
            {OFFICES.map((office) => (
              <li
                key={office.name}
                className="grid gap-x-6 gap-y-1 border-t border-dotted border-stone/40 py-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
              >
                <div>
                  <h3 className="mb-1 text-lg">{t(office.name)}</h3>
                  <p className="mb-1 text-sm text-stone">{t(office.descriptionKey)}</p>
                  <address className="text-sm not-italic">{formatAddress(office)}</address>
                </div>
                <a href={office.map} className="text-sm font-medium text-brand underline underline-offset-4 hover:text-brand-deep">
                  {common('viewOnMap')} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export async function VariantC() {
  const common = await getTranslations('common')
  const locale = (await getLocale()) as keyof typeof COPY
  const copy = COPY[locale] ?? COPY.ca
  const [mailbox, domain] = EMAIL.split('@')
  return (
    <>
      <span id="contact" />
      <section aria-labelledby="contact-heading" className="mx-auto max-w-content px-5 py-16 text-center md:py-20">
        <p className="mb-3 text-sm font-medium tracking-widest text-stone uppercase">{common('contact')}</p>
        <h2 id="contact-heading" className="mb-4 text-4xl">
          {copy.lead}
        </h2>
        <p className="mx-auto mb-8 max-w-measure text-lg text-pretty text-stone">{copy.sub}</p>
        <div className="flex flex-col items-center justify-center gap-x-10 gap-y-3 font-display text-2xl md:flex-row">
          <a href={`mailto:${EMAIL}`} className="text-brand underline decoration-1 underline-offset-8 hover:text-brand-deep">
            {mailbox}
            <wbr />@{domain}
          </a>
          <span aria-hidden className="hidden text-mist md:inline">
            ·
          </span>
          {TELEPHONES.map(({ number }, i) => (
            <span key={number} className="contents">
              <a href={telephoneHref(number)} className="text-ink underline decoration-mist decoration-1 underline-offset-8 hover:decoration-brand">
                {formatTelephone(number)}
              </a>
              {i < TELEPHONES.length - 1 && (
                <span aria-hidden className="hidden text-mist md:inline">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </section>
    </>
  )
}

export async function VariantD() {
  return <Divider />
}
