import Link from 'next/link'

// Ported verbatim; localising it and dropping the redirect it never performs
// is the 404 page's own ticket.
export default function NotFoundContent() {
  return (
    <div className="text-center">
      <h1 className="pt-4">404</h1>
      <h2>Ooops! This page cannot be found :(</h2>
      <p>
        Redirecting to{' '}
        <Link href="/" className="text-brand underline">
          Homepage
        </Link>{' '}
        for more content
      </p>
    </div>
  )
}
