/** An Article's tags, each its own list item. */
export default function ArticleTags({ tags, label }: { tags: string[]; label: string }) {
  if (tags.length === 0) return null

  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-rose px-3 py-0.5 text-sm text-stone">
          {tag}
        </li>
      ))}
    </ul>
  )
}
