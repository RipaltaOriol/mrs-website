/** The email address the firm takes enquiries on. */
export const EMAIL = 'administracio@mrsassessors.com'

/** A firm telephone number, as the nine digits dialled nationally, and the kind of line it rings. */
export type Telephone = {
  number: string
  kind: 'mobile' | 'landline'
}

export const TELEPHONES: readonly Telephone[] = [
  { number: '618630099', kind: 'mobile' },
  { number: '972371821', kind: 'landline' },
]

/** A telephone number as a dialable URL, in international form. */
export function telephoneHref(telephone: string): string {
  return `tel:+34${telephone}`
}

/** A telephone number grouped as it is written locally: 972 37 18 21. */
export function formatTelephone(telephone: string): string {
  return telephone.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
}
