import { Montserrat } from 'next/font/google'

// Downloaded at build time and served from the site itself.
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-montserrat',
})
