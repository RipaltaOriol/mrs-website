import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const config: NextConfig = {
  // The social preview images read these from disk at request time.
  outputFileTracingIncludes: {
    '/**/opengraph-image': ['./assets/fonts/*.ttf', './public/logo.png'],
  },
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.ctfassets.net' }],
  },
}

export default withNextIntl(config)
