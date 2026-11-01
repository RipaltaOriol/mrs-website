/** One of the firm's two physical locations, with its own address and map link. */
export type Office = {
  name: string
  descriptionKey: 'office1' | 'office2'
  street: string
  postcode: string
  town: string
  map: string
}

export const OFFICES: readonly Office[] = [
  {
    name: 'Sede Central Lloret de Mar',
    descriptionKey: 'office1',
    street: 'Calle Can Guidet, núm. 5 local 1A',
    postcode: '17310',
    town: 'Lloret de Mar',
    map: 'https://goo.gl/maps/CuMMNSxdEvmvxePt9',
  },
  {
    name: 'Oficina Lloret de Mar',
    descriptionKey: 'office2',
    street: 'Passeig Jacint Verdaguer, núm. 8',
    postcode: '17310',
    town: 'Lloret de Mar',
    map: 'https://goo.gl/maps/7QK7f6fKXKPq2Yjc8',
  },
] as const

/** An Office address on one line. */
export function formatAddress({ street, postcode, town }: Office): string {
  return `${street}. ${postcode} ${town}`
}
