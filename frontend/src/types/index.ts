export type ArticleStatus = 'pending' | 'transformed' | 'failed'

export interface Source {
  id: string
  name: string
  url: string
  createdAt: string
}

export interface Article {
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
}

export interface ChatMessage {
  id: string
  articleId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ArticlesResponse {
  articles: Article[]
  total: number
}

export interface ScrapeResponse {
  success: boolean
  message: string
}