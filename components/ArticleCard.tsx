import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { ArticleSummary } from '@/lib/content'

/** One Article in the index, as react-bootstrap's `Card` presented it. */
export default function ArticleCard({
  article,
  readMore,
}: {
  article: ArticleSummary
  readMore: string
}) {
  const href = `/blogs/${article.slug}`

  return (
    <article className="flex flex-col overflow-hidden rounded border border-mist bg-white">
      <Image
        src={article.thumbnail.url}
        alt={article.thumbnail.alt}
        width={article.thumbnail.width}
        height={article.thumbnail.height}
        // `sizes` is an HTML attribute and cannot read a theme token, so the
        // widths below mirror the three-column grid this card sits in.
        sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw"
        className="h-50 w-full object-cover"
      />
      <div className="flex grow flex-col p-4">
        <h3>
          <Link href={href} className="hover:text-brand">
            {article.title}
          </Link>
        </h3>
        {article.tags.length > 0 && (
          <p className="mb-2 text-sm text-brand">{article.tags.join(' - ')}</p>
        )}
        {article.preview && <p>{article.preview}</p>}
        <Link href={href} className="btn mt-auto self-start">
          {readMore}
        </Link>
      </div>
    </article>
  )
}
