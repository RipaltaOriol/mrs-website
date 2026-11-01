import type about from '../locales/ca/about.json'
import type blog from '../locales/ca/blog.json'
import type common from '../locales/ca/common.json'
import type home from '../locales/ca/home.json'
import type meta from '../locales/ca/meta.json'
import type notFound from '../locales/ca/notFound.json'
import type policy from '../locales/ca/policy.json'
import type { routing } from './routing'

// Catalan is the reference Locale: translation keys are checked against it.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: { common: typeof common; home: typeof home; about: typeof about; blog: typeof blog; policy: typeof policy; notFound: typeof notFound; meta: typeof meta }
  }
}
