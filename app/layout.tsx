import type { ReactNode } from 'react'

// The document (and its `lang`) is rendered by `app/[locale]/layout.tsx`.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
