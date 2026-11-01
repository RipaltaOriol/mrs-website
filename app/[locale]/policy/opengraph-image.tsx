import { routing } from '@/i18n/routing'
import { pageSocialImage } from '@/lib/page-social-image'
import { SOCIAL_IMAGE } from '@/lib/social-image'

export const { alt, size, contentType } = SOCIAL_IMAGE

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default function Image(props: { params: Promise<{ locale: string }> }) {
  return pageSocialImage('policy', props)
}
