import { Link } from 'react-router-dom'
import type { Article } from '../types'
import { SourceBadge } from './SourceBadge'

interface ArticleCardProps {
  article: Article
  sourceName: string
}

export function ArticleCard({ article, sourceName }: ArticleCardProps) {
  return (
    <Link to={`/articles/${article.id}`}>
      <article className="bg-white border-3 border-black shadow-[4px_4px_0_black] p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all cursor-pointer">
        <div className="mb-3">
          <SourceBadge name={sourceName} />
        </div>
        <h2 className="text-xl font-black uppercase mb-3 leading-tight">
          {article.fakeTitle || 'Untitled'}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {article.fakeDescription || ''}
        </p>
      </article>
    </Link>
  )
}