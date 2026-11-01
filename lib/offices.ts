/** One of the firm's two physical locations, with its own address and map. */
export type Office = {
  name: string
  descriptionKey: 'office1' | 'office2'
  street: string
  postcode: string
  town: string
  map: string
  embed: string
}

export const OFFICES: readonly Office[] = [
  {
    name: 'Sede Central Lloret de Mar',
    descriptionKey: 'office1',
    street: 'Calle Can Guidet, núm. 5 local 1A',
    postcode: '17310',
    town: 'Lloret de Mar',
    map: 'https://goo.gl/maps/CuMMNSxdEvmvxePt9',
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.6659586374553!2d2.8366444158267274!3d41.70614637923619!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12bb17400ec35253%3A0x689006a99e92cb89!2sMRS%20Assessors!5e0!3m2!1sen!2ses!4v1641165940319!5m2!1sen!2ses',
  },
  {
    name: 'Oficina Lloret de Mar',
    descriptionKey: 'office2',
    street: 'Passeig Jacint Verdaguer, núm. 8',
    postcode: '17310',
    town: 'Lloret de Mar',
    map: 'https://goo.gl/maps/7QK7f6fKXKPq2Yjc8',
    embed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.9934371028303!2d2.8462348158265196!3d41.69907737923678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12bb173097443d4d%3A0x3b897f62f299b8b8!2sPasseig%20de%20Jacint%20Verdaguer%2C%208%2C%2017310%20Lloret%20de%20Mar%2C%20Girona!5e0!3m2!1sen!2ses!4v1641166537812!5m2!1sen!2ses',
  },
] as const

/** An Office address on one line. */
export function formatAddress({ street, postcode, town }: Office): string {
  return `${street}. ${postcode} ${town}`
}
