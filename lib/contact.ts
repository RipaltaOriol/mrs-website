/** The email address the firm takes enquiries on. */
export const EMAIL = 'administracio@mrsassessors.com'

/** The firm's telephone numbers, as the nine digits dialled nationally. */
export const TELEPHONES = ['972371821', '972372240'] as const

/** A telephone number as a dialable URL, in international form. */
export function telephoneHref(telephone: string): string {
  return `tel:+34${telephone}`
}

/** A telephone number grouped as it is written locally: 972 37 18 21. */
export function formatTelephone(telephone: string): string {
  return telephone.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
}
