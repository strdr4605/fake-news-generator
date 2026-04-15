# Frontend Design Spec

## Overview

React 18 + Vite + React Query + Tailwind v4 frontend for Fake News Generator app. Neo-brutalist visual style.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Query (data fetching + caching)
- React Router v7 (routing)
- Axios (HTTP client)
- Tailwind v4 (styling)

## Pages

### Feed Page (`/`)

- Full-width header: "FAKE NEWS" title (bold, uppercase) + Scrape button
- Article cards in vertical list with infinite scroll (status=transformed only, sorted by publishedAt DESC)
- Card design: white bg, 3px black border, 4px offset box-shadow, fake title (bold/large), description (smaller), source badge
- Scrape button triggers POST /api/v1/scrape, shows spinner during request
- On scrape success: show success toast + refetch articles list
- On scrape error: show error toast

### Article Page (`/articles/:id`)

- 2-column layout: article (left, flex-grow) + chat drawer (right, fixed 400px width)
- Toggle button (top-right area) to show/hide chat drawer
- Article column: bold title, description, source badge, published date, "View Original" link
- Chat column: scrollable message history + input field at bottom
- Both columns scroll independently
- Chat button toggles drawer state, does NOT navigate

## Components

| Component | Description |
|-----------|-------------|
| `Layout` | Header with title, wraps all pages |
| `ArticleCard` | Feed item: fake title, description, source badge, click → article page |
| `ScrapeButton` | Button that triggers scrape, shows spinner, auto-refreshes feed on success |
| `ChatDrawer` | Right panel: toggle button, message list, input field |
| `ChatMessage` | Single message: user (right/aligned), assistant (left/aligned) |
| `InfiniteArticleList` | Infinite scroll wrapper using React Query |
| `SourceBadge` | Small badge showing source name |

## API Integration

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/articles?limit=20&offset={page*20}&status=transformed` | Fetch articles (infinite query) |
| GET | `/api/v1/sources` | Fetch sources for badges |
| GET | `/api/v1/articles/:id` | Fetch single article |
| GET | `/api/v1/articles/:id/chat` | Fetch chat history |
| POST | `/api/v1/articles/:id/chat` | Send chat message |
| POST | `/api/v1/scrape` | Trigger RSS scrape |

### React Query Keys

- `['articles', page]` — infinite articles list
- `['sources']` — sources list
- `['article', id]` — single article
- `['chat', articleId]` — chat messages for article

## Visual Design (Neo-Brutalist)

### Colors

- Background: white (#FFFFFF)
- Text: black (#000000)
- Accent: yellow (#FFFF00)
- Borders: black (#000000) 3px solid
- Card shadow: 4px 4px 0 black

### Typography

- Headings: bold, uppercase
- Body: regular weight
- Font: system monospace for labels, sans-serif for body

### Spacing

- Card padding: 16px
- Card gap: 24px
- Border radius: 0 (sharp corners)

### Components

- Buttons: black bg, white text, 3px border, offset shadow, uppercase text
- Inputs: 3px black border, no shadow, white bg
- Badges: small, uppercase, black bg, white text

## File Structure

```
frontend/src/
├── main.tsx
├── index.css
├── api/
│   └── client.ts
├── components/
│   ├── Layout.tsx
│   ├── ArticleCard.tsx
│   ├── ScrapeButton.tsx
│   ├── ChatDrawer.tsx
│   ├── ChatMessage.tsx
│   └── SourceBadge.tsx
├── pages/
│   ├── FeedPage.tsx
│   └── ArticlePage.tsx
└── types/
    └── index.ts
```

## Data Flow

1. Feed page mounts → React Query fetches articles (transformed status, paginated)
2. User scrolls → React Query fetches next page, appends to list
3. User clicks article → navigate to /articles/:id
4. Article page mounts → fetch article + chat history in parallel
5. User types message → POST to /articles/:id/chat → append response to list
6. User clicks Scrape → POST /scrape → show loading → on success refetch articles

## State Management

- Server state: React Query (articles, sources, chat)
- UI state: React useState (chat drawer open, message input)
- No global state library needed