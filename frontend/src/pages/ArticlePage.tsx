import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { fetchArticle, fetchSources } from '../api/client'
import { ChatDrawer } from '../components/ChatDrawer'
import { SourceBadge } from '../components/SourceBadge'
import type { Source } from '../types'

export function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
  })

  const { data: sourcesData } = useQuery({ queryKey: ['sources'], queryFn: fetchSources })
  const sourceName = sourcesData?.sources?.find((s: Source) => s.id === article?.sourceId)?.name || 'Unknown'

  const toggleChat = () => setIsChatOpen((prev) => !prev)

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="font-bold text-xl uppercase">Loading...</p>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <p className="font-bold text-xl uppercase text-red-600">Article not found</p>
        <Link to="/" className="mt-4 inline-block bg-black text-white px-4 py-2 font-bold uppercase border-3 border-black shadow-[4px_4px_0_black] hover:bg-gray-800">
          Back to Feed
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <article className={`flex-1 transition-all duration-300 ${isChatOpen ? 'pr-[440px]' : ''}`}>
        <Link to="/" className="inline-block mb-6 bg-black text-white px-4 py-2 font-bold uppercase border-3 border-black shadow-[4px_4px_0_black] hover:bg-gray-800">
          Back
        </Link>

        <div className="bg-white border-3 border-black shadow-[4px_4px_0_black] p-8">
          <div className="mb-4">
            <SourceBadge name={sourceName} />
            {article.publishedAt && (
              <span className="ml-3 text-sm text-gray-500 font-medium">
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black uppercase mb-6 leading-tight">{article.fakeTitle || 'Untitled'}</h1>

          <p className="text-lg leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: article.fakeDescription || '' }} />

          {article.originalUrl && (
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-bold uppercase underline hover:no-underline"
            >
              View Original Article →
            </a>
          )}
        </div>
      </article>

      <ChatDrawer
        articleId={id!}
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
    </div>
  )
}
