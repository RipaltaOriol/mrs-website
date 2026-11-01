import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { ArticleSummary } from '@/lib/content'
import ArticleTags from './ArticleTags'
import PublishedDate from './PublishedDate'

/** One Article as a row of the Notícies index. */
export default function ArticleListItem({
  article,
  locale,
  tagsLabel,
}: {
  article: ArticleSummary
  locale: Locale
  tagsLabel: string
}) {
  const href = `/blogs/${article.slug}`

  return (
    <li className="group relative grid gap-x-8 gap-y-3 border-t border-mist py-8 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_10rem]">
      <div>
        <PublishedDate date={article.published} locale={locale} className="block" />
        <h2 className="mt-2 mb-3 text-2xl">
          <Link
            href={href}
            className="text-ink underline-offset-4 after:absolute after:inset-0 group-hover:text-brand group-hover:underline"
          >
            {article.title}
          </Link>
        </h2>
        {article.preview && <p className="text-pretty text-stone">{article.preview}</p>}
        <ArticleTags tags={article.tags} label={tagsLabel} />
      </div>
      <div className="relative hidden aspect-landscape overflow-hidden rounded bg-mist sm:block">
        <Image
          src={article.thumbnail.url}
          alt={article.thumbnail.alt}
          fill
          sizes="10rem"
          className="object-cover"
        />
      </div>
    </li>
  )
}
