export type ArticleStatus = 'pending' | 'transformed' | 'failed'

export type Source = {
  id: string
  name: string
  fakeName: string | null
  url: string
  createdAt: string
}

export type Article = {
  id: string
  sourceId: string
  originalTitle: string
  originalDescription: string | null
  originalUrl: string | null
  fakeTitle: string | null
  fakeDescription: string | null
  status: ArticleStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  sourceName?: string
  sourceFakeName?: string | null
}

export type ChatMessage = {
  id: string
  articleId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type ArticlesResponse = {
  articles: Article[]
  total: number
}

export type ScrapeResponse = {
  success: boolean
  message: string
}