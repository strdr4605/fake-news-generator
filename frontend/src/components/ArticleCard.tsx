import { Link } from 'react-router-dom'
import type { Article } from '../types'
import { SourceBadge } from './SourceBadge'

function getFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>(.*?)<\/p>/i)
  if (match) return match[0]
  const textOnly = html.replace(/<[^>]+>/g, '')
  return textOnly.slice(0, 200) + (textOnly.length > 200 ? '...' : '')
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

type ArticleCardProps = {
  article: Article
  sourceName: string
}

function SkeletonCard({ publishedAt }: { publishedAt: string | null }) {
  return (
    <div className="bg-white border-3 border-black shadow-[4px_4px_0_black] p-6 opacity-60">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-24 bg-gray-300 animate-pulse rounded" />
        {publishedAt && (
          <span className="text-xs text-gray-500 font-medium">
            {formatDate(publishedAt)}
          </span>
        )}
      </div>
      <div className="h-7 w-full bg-gray-300 animate-pulse rounded mb-3" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="mt-4 h-4 w-32 bg-gray-200 animate-pulse rounded" />
    </div>
  )
}

export function ArticleCard({ article, sourceName }: ArticleCardProps) {
  if (article.status === 'pending') {
    return <SkeletonCard publishedAt={article.publishedAt} />
  }

  return (
    <Link to={`/articles/${article.id}`}>
      <article className="bg-white border-3 border-black shadow-[4px_4px_0_black] p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all cursor-pointer">
        <div className="mb-3 flex items-center gap-2">
          <SourceBadge name={sourceName} />
          {article.publishedAt && (
            <span className="text-xs text-gray-500 font-medium">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>
        <h2 className="text-xl font-black uppercase mb-3 leading-tight">
          {article.fakeTitle || 'Untitled'}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: getFirstParagraph(article.fakeDescription || '') + ' <span class="font-bold uppercase">Continue reading →</span>' }} />
      </article>
    </Link>
  )
}