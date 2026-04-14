# Fake News Generator — Design Spec

**Date:** 2026-04-14
**Stack:** Node.js + Fastify + TypeScript | Drizzle + PostgreSQL | React + Vite + React Query + Tailwind CSS | nginx

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     docker-compose                          │
│  ┌──────────────────┐    ┌─────────────────────────────┐   │
│  │   api (Fastify)  │    │    frontend (nginx)         │   │
│  │  ┌────────────┐  │    │    serves /dist static      │   │
│  │  │  API routes│  │    │                             │   │
│  │  └────────────┘  │    └─────────────────────────────┘   │
│  │  ┌────────────┐  │                                     │
│  │  │  Worker    │  │                                     │
│  │  │ (interval) │  │                                     │
│  │  └────────────┘  │                                     │
│  └────────┬─────────┘                                     │
│           │                                                │
│  ┌────────▼─────────┐                                      │
│  │   postgres       │                                      │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

### Services

**api** — Fastify + TypeScript
- REST API endpoints
- Background worker (setInterval) for async transformation
- Serves API at port 3000

**frontend** — React + Vite
- nginx serves production build from /dist
- Proxies /api/* to api service
- Port 8080

**postgres** — PostgreSQL database
- Drizzle ORM for type-safe queries
- Migrations via Drizzle Kit

---

## Data Model

### Tables

**sources**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| name | text | e.g. "New York Times" |
| url | text | RSS feed URL |
| created_at | timestamp | |

**articles**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| source_id | uuid | FK → sources.id |
| original_title | text | |
| original_description | text | |
| original_url | text | |
| fake_title | text | LLM-generated satirical title |
| fake_description | text | LLM-generated satirical description |
| status | text | 'pending' \| 'transformed' \| 'failed' |
| published_at | timestamp | From RSS |
| created_at | timestamp | |
| updated_at | timestamp | |

**chat_messages**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| article_id | uuid | FK → articles.id |
| role | text | 'user' \| 'assistant' |
| content | text | |
| created_at | timestamp | |

---

## API Design

### Scrape & Transform

**POST /api/scrape**
- Fetches RSS from all configured sources
- Saves raw articles with `status: 'pending'`
- Response: `{ scraped: number }`

**GET /api/articles**
- Query params: `source`, `status`
- Returns articles with source info
- Response: `{ articles: Article[] }`

**GET /api/articles/:id**
- Returns single article with chat history
- Response: `{ article: ArticleWithChat }`

### Chat

**POST /api/articles/:id/chat**
- Body: `{ message: string }`
- Saves user message, calls OpenAI, saves assistant response
- Response: `{ messages: ChatMessage[] }`

**GET /api/articles/:id/chat**
- Returns chat history for article
- Response: `{ messages: ChatMessage[] }`

### Sources

**GET /api/sources**
- Returns all configured RSS sources
- Response: `{ sources: Source[] }`

---

## Async Pipeline

1. `POST /api/scrape` saves articles with `status: 'pending'`
2. Background worker (setInterval, every 5s) polls for `status = 'pending'`
3. Worker calls OpenAI API to transform article
4. On success: update `fake_title`, `fake_description`, set `status: 'transformed'`
5. On failure: set `status: 'failed'`, log error

---

## Frontend Structure

### Pages

**/** — News Feed
- List of fake articles (title, snippet, source, date)
- Filter dropdown by source
- "Scrape Now" button triggers backend scrape

**/article/:id** — Article Detail
- Full fake article display
- Toggle to show original article
- Chat panel sidebar

### Components

- `ArticleCard` — Feed item
- `ArticleDetail` — Full article with toggle
- `ChatPanel` — Message list + input
- `SourceFilter` — Dropdown filter
- `ScrapeButton` — Triggers scrape

### State

- React Query for server state (articles, chat)
- No complex client state management needed

---

## LLM Integration

- Model: gpt-4o-mini (cost-effective, sufficient for this task)
- Key via `OPENAI_API_KEY` env var (in api container)
- Transform prompt: given original title + description, produce satirical version
- Chat prompt: contextual answers about the article

---

## Error Handling

- Scraping failures: individual article failures don't crash the scrape
- Transformation failures: article marked `status: 'failed'`, retryable
- Chat failures: return 500 with error message
- All errors logged server-side

---

## Docker Setup

**api/Dockerfile** — Node.js production build
**frontend/Dockerfile** — nginx with static build

**docker-compose.yml**
- api service: port 3000
- frontend service: port 8080
- postgres service: port 5432
- env file for database connection

---

## Decisions & Tradeoffs

1. **Node.js vs Python** — Chose Node.js for end-to-end TypeScript, simpler Docker setup
2. **PostgreSQL vs SQLite** — PostgreSQL for proper RDBMS, JSONB support
3. **Drizzle vs Prisma** — Drizzle for lightweight, SQL-like approach
4. **DB-backed queue vs BullMQ** — Chose simpler DB-backed; BullMQ would add Redis complexity for 4hr task
5. **Vite build + nginx vs dev server** — Static build served by nginx for production parity
6. **Free-form chat vs predefined actions** — Free-form for flexibility, relies on prompt engineering
