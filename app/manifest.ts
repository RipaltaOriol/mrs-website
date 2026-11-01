import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/metadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    start_url: '/',
    display: 'browser',
    background_color: '#f7f3f0',
    theme_color: '#99032e',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
