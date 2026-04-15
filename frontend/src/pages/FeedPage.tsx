import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { fetchArticles } from '../api/client'
import { ArticleCard } from '../components/ArticleCard'
import { ScrapeButton } from '../components/ScrapeButton'
import type { Article } from '../types'

export function FeedPage() {
  const { ref: loadMoreRef, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: ({ pageParam = 0 }) => fetchArticles(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.articles.length < 20) return undefined
      return lastPageParam + 1
    },
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allArticles = data?.pages.flatMap((page) => page.articles) || []

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tight">Latest Fake News</h1>
        <ScrapeButton />
      </div>

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
