# Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build React frontend with neo-brutalist styling, infinite scroll feed, article detail page with chat drawer.

**Architecture:** React 18 + Vite + React Query + React Router. Axios for HTTP. Tailwind v4 for styling. Neo-brutalist visual design with black borders, offset shadows, yellow accent.

**Tech Stack:** React 18, TypeScript, Vite 6, React Query v5, React Router v7, Axios, Tailwind v4

---

## File Structure

```
frontend/src/
├── main.tsx              # Router + React Query setup (modify)
├── index.css            # Global brutalist styles + Tailwind (modify)
├── types/
│   └── index.ts         # TypeScript types (create)
├── api/
│   └── client.ts        # Axios instance (create)
├── components/
│   ├── Layout.tsx       # Header wrapper (create)
│   ├── ArticleCard.tsx  # Feed item card (create)
│   ├── SourceBadge.tsx  # Source name badge (create)
│   ├── ScrapeButton.tsx # Scrape trigger button (create)
│   ├── ChatDrawer.tsx   # Toggleable right panel (create)
│   └── ChatMessage.tsx  # Single chat message (create)
└── pages/
    ├── FeedPage.tsx     # Main feed with infinite scroll (create)
    └── ArticlePage.tsx   # Article + chat drawer (create)
```

---

## Task 1: TypeScript Types

**Files:**
- Create: `frontend/src/types/index.ts`

- [ ] **Step 1: Create types file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat(frontend): add TypeScript types"
```

---

## Task 2: API Client

**Files:**
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: Create API client**

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchArticles(page: number, limit = 20) {
  const offset = page * limit
  const { data } = await api.get('/articles', { params: { limit, offset, status: 'transformed' } })
  return data
}

export async function fetchSources() {
  const { data } = await api.get('/sources')
  return data
}

export async function fetchArticle(id: string) {
  const { data } = await api.get(`/articles/${id}`)
  return data
}

export async function fetchChat(articleId: string) {
  const { data } = await api.get(`/articles/${articleId}/chat`)
  return data
}

export async function sendChatMessage(articleId: string, message: string) {
  const { data } = await api.post(`/articles/${articleId}/chat`, { message })
  return data
}

export async function triggerScrape() {
  const { data } = await api.post('/scrape')
  return data
}

export default api
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/client.ts
git commit -m "feat(frontend): add API client with axios"
```

---

## Task 3: Layout Component

**Files:**
- Create: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: Create Layout component**

```tsx
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-3 border-black bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black uppercase tracking-tight hover:underline">
            Fake News
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Layout.tsx
git commit -m "feat(frontend): add Layout component with header"
```

---

## Task 4: SourceBadge Component

**Files:**
- Create: `frontend/src/components/SourceBadge.tsx`

- [ ] **Step 1: Create SourceBadge component**

```tsx
interface SourceBadgeProps {
  name: string
}

export function SourceBadge({ name }: SourceBadgeProps) {
  return (
    <span className="inline-block bg-black text-white text-xs font-bold uppercase px-2 py-1">
      {name}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/SourceBadge.tsx
git commit -m "feat(frontend): add SourceBadge component"
```

---

## Task 5: ArticleCard Component

**Files:**
- Create: `frontend/src/components/ArticleCard.tsx`

- [ ] **Step 1: Create ArticleCard component**

```tsx
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
          {article.fakeTitle}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {article.fakeDescription}
        </p>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ArticleCard.tsx
git commit -m "feat(frontend): add ArticleCard component"
```

---

## Task 6: ScrapeButton Component

**Files:**
- Create: `frontend/src/components/ScrapeButton.tsx`

- [ ] **Step 1: Create ScrapeButton component**

```tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggerScrape } from '../api/client'

export function ScrapeButton() {
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const queryClient = useQueryClient()

  const scrapeMutation = useMutation({
    mutationFn: triggerScrape,
    onSuccess: () => {
      setToastType('success')
      setShowToast(true)
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setTimeout(() => setShowToast(false), 3000)
    },
    onError: () => {
      setToastType('error')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    },
  })

  return (
    <div className="relative">
      <button
        onClick={() => scrapeMutation.mutate()}
        disabled={scrapeMutation.isPending}
        className="bg-yellow-400 border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-black uppercase text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_black]"
      >
        {scrapeMutation.isPending ? 'Scraping...' : 'Scrape'}
      </button>
      {showToast && (
        <div className={`absolute top-full mt-2 left-0 border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-bold text-sm ${toastType === 'success' ? 'bg-green-400' : 'bg-red-400'}`}>
          {toastType === 'success' ? 'Scrape complete!' : 'Scrape failed'}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ScrapeButton.tsx
git commit -m "feat(frontend): add ScrapeButton with toast feedback"
```

---

## Task 7: ChatMessage Component

**Files:**
- Create: `frontend/src/components/ChatMessage.tsx`

- [ ] **Step 1: Create ChatMessage component**

```tsx
import type { ChatMessage as ChatMessageType } from '../types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 border-3 border-black ${
          isUser
            ? 'bg-yellow-400 shadow-[4px_4px_0_black]'
            : 'bg-white shadow-[4px_4px_0_black]'
        }`}
      >
        <p className="text-sm font-medium leading-relaxed">{message.content}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ChatMessage.tsx
git commit -m "feat(frontend): add ChatMessage component"
```

---

## Task 8: ChatDrawer Component

**Files:**
- Create: `frontend/src/components/ChatDrawer.tsx`

- [ ] **Step 1: Create ChatDrawer component**

```tsx
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchChat, sendChatMessage } from '../api/client'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType } from '../types'

interface ChatDrawerProps {
  articleId: string
  isOpen: boolean
  onToggle: () => void
}

export function ChatDrawer({ articleId, isOpen, onToggle }: ChatDrawerProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading } = useQuery<ChatMessageType[]>({
    queryKey: ['chat', articleId],
    queryFn: () => fetchChat(articleId),
    enabled: isOpen,
  })

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendChatMessage(articleId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', articleId] })
      setInput('')
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !sendMutation.isPending) {
      sendMutation.mutate(input.trim())
    }
  }

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-24 right-4 bg-black text-white border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-black uppercase text-sm z-40 hover:bg-gray-800"
      >
        {isOpen ? 'Close Chat' : 'Chat'}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l-3 border-black transform transition-transform duration-300 z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="border-b-3 border-black p-4">
          <h3 className="font-black uppercase text-lg">Chat</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500 font-bold">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 font-bold">No messages yet. Say hello!</p>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t-3 border-black p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this article..."
              className="flex-1 border-3 border-black px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              disabled={sendMutation.isPending}
            />
            <button
              type="submit"
              disabled={sendMutation.isPending || !input.trim()}
              className="bg-yellow-400 border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-black uppercase text-sm disabled:opacity-50 hover:bg-yellow-300 active:translate-x-[2px] active:translate-y-[2px]"
            >
              {sendMutation.isPending ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ChatDrawer.tsx
git commit -m "feat(frontend): add ChatDrawer component with toggle"
```

---

## Task 9: FeedPage

**Files:**
- Create: `frontend/src/pages/FeedPage.tsx`

- [ ] **Step 1: Create FeedPage with infinite scroll**

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { fetchArticles, fetchSources } from '../api/client'
import { ArticleCard } from '../components/ArticleCard'
import { ScrapeButton } from '../components/ScrapeButton'
import type { Article, Source } from '../types'

export function FeedPage() {
  const { ref: loadMoreRef, inView } = useInView()

  const { data: sourcesData } = useQuery({ queryKey: ['sources'], queryFn: fetchSources })
  const sourcesMap = (sourcesData?.sources || []).reduce((acc: Record<string, string>, s: Source) => {
    acc[s.id] = s.name
    return acc
  }, {})

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
              sourceName={sourcesMap[article.sourceId] || 'Unknown'}
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
```

**Note:** Install `react-intersection-observer` for infinite scroll. Add to package.json dependencies.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/FeedPage.tsx
git commit -m "feat(frontend): add FeedPage with infinite scroll"
```

---

## Task 10: ArticlePage

**Files:**
- Create: `frontend/src/pages/ArticlePage.tsx`

- [ ] **Step 1: Create ArticlePage with 2-column layout**

```tsx
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

          <h1 className="text-3xl font-black uppercase mb-6 leading-tight">{article.fakeTitle}</h1>

          <p className="text-lg leading-relaxed mb-8">{article.fakeDescription}</p>

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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/ArticlePage.tsx
git commit -m "feat(frontend): add ArticlePage with chat drawer"
```

---

## Task 11: Main.tsx Router Setup

**Files:**
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Update main.tsx with router and React Query**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { FeedPage } from './pages/FeedPage'
import { ArticlePage } from './pages/ArticlePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/articles/:id" element={<ArticlePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/main.tsx
git commit -m "feat(frontend): add router and React Query setup"
```

---

## Task 12: Global CSS Styles

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/package.json` (add react-intersection-observer dependency)

- [ ] **Step 1: Update index.css with brutalist styles**

```css
@import "tailwindcss"

@theme {
  --border-3: 3px solid black;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: white;
  color: black;
}

* {
  box-sizing: border-box;
}

::selection {
  background: #FFFF00;
  color: black;
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: white;
  border-left: 3px solid black;
}

::-webkit-scrollbar-thumb {
  background: black;
}

::-webkit-scrollbar-thumb:hover {
  background: #333;
}
```

- [ ] **Step 2: Update package.json to add react-intersection-observer**

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "react-intersection-observer": "^9.0.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
cd frontend && npm install
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/index.css frontend/package.json
git commit -m "style(frontend): add brutalist CSS styles and scrollbar"
```

---

## Self-Review Checklist

1. **Spec coverage:** All spec requirements covered:
   - Feed page with infinite scroll ✓
   - Article cards with fake title/description/source badge ✓
   - Scrape button with toast ✓
   - Article page with 2-column layout ✓
   - Chat drawer toggle ✓
   - Neo-brutalist styling (black borders, offset shadows, yellow accent) ✓

2. **Placeholder scan:** No "TBD", "TODO", or incomplete sections.

3. **Type consistency:** All types used consistently:
   - `Article`, `Source`, `ChatMessage` types match API schema
   - Function signatures match (fetchArticles, fetchChat, sendChatMessage, triggerScrape)

4. **Dependencies:** `react-intersection-observer` needs to be installed for infinite scroll.

---

## Execution

**Plan complete and saved to `docs/superpowers/plans/2026-04-14-frontend-implementation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?