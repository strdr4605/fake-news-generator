import { useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { fetchArticles, fetchSources } from '../api/client'
import { ArticleCard } from '../components/ArticleCard'
import { ScrapeButton } from '../components/ScrapeButton'
import type { Article, Source } from '../types'

export function FeedPage() {
  const { ref: loadMoreRef, inView } = useInView()
  const [selectedSource, setSelectedSource] = useState<string | null>(null)

  const { data: sourcesData } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['articles', selectedSource],
    queryFn: ({ pageParam = 0 }) => fetchArticles(pageParam, 20, selectedSource || undefined),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.articles.length < 20) return undefined
      return lastPageParam + 1
    },
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allArticles = data?.pages.flatMap((page) => page.articles) || []
  const sources: Source[] = sourcesData?.sources || []
  const pendingCount = allArticles.filter(a => a.status === 'pending').length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Latest Fake News</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-gray-500 mt-1 animate-pulse">
              Processing {pendingCount} article{pendingCount > 1 ? 's' : ''}...
            </p>
          )}
        </div>
        <ScrapeButton />
      </div>

      {sources.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedSource(null)}
            className={`px-4 py-2 font-bold uppercase text-sm border-3 border-black shadow-[2px_2px_0_black] transition-all cursor-pointer ${
              selectedSource === null
                ? 'bg-black text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            All Sources
          </button>
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`px-4 py-2 font-bold uppercase text-sm border-3 border-black shadow-[2px_2px_0_black] transition-all cursor-pointer ${
                selectedSource === source.id
                  ? 'bg-black text-white'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="font-bold text-xl uppercase">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="font-bold text-xl uppercase text-red-600">Failed to load articles</p>
        </div>
      ) : allArticles.length === 0 ? (
        <div className="text-center py-12 border-3 border-black shadow-[4px_4px_0_black] p-8">
          <p className="font-bold text-xl uppercase mb-4">No articles yet</p>
          <p className="text-gray-600">Click "Scrape" to fetch articles from RSS feeds.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {allArticles.map((article: Article) => (
            <ArticleCard
              key={article.id}
              article={article}
              sourceName={article.sourceName || 'Unknown'}
            />
          ))}
          {hasNextPage && (
            <div ref={loadMoreRef} className="text-center py-8">
              {isFetchingNextPage && (
                <p className="font-bold uppercase">Loading more...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
