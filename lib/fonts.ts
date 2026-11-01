import { Inter, Newsreader } from 'next/font/google'

// next/font downloads these at build time and serves them from the site's own origin.
export const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
