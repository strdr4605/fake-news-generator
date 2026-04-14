# Fake News Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full-stack fake news generator — scrapes RSS feeds, transforms articles via OpenAI LLM, displays in React UI, supports chat per article.

**Architecture:** Fastify API + Drizzle ORM + PostgreSQL. Background worker (setInterval) polls DB for pending articles, calls OpenAI, updates. React + Vite + React Query frontend served by nginx.

**Tech Stack:** Node.js | Fastify | TypeScript | Drizzle | PostgreSQL | React | Vite | React Query | Tailwind CSS | nginx | Docker | OpenAI API

---

## File Structure

```
/app
├── docs/superpowers/plans/
├── docker-compose.yml
├── .env.example
├── api/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client
│   │   │   ├── schema.ts         # Table definitions
│   │   │   └── migrations/
│   │   ├── routes/
│   │   │   ├── index.ts          # Route aggregator
│   │   │   ├── scrape.ts         # POST /api/scrape
│   │   │   ├── articles.ts        # GET /api/articles, GET /api/articles/:id
│   │   │   ├── chat.ts            # GET/POST /api/articles/:id/chat
│   │   │   └── sources.ts         # GET /api/sources
│   │   ├── services/
│   │   │   ├── scraper.ts         # RSS fetch + parse
│   │   │   ├── transformer.ts     # OpenAI LLM call
│   │   │   └── chat.ts            # Chat LLM call
│   │   ├── worker.ts              # Background job runner
│   │   └── index.ts               # Fastify app entry
│   ├── drizzle.config.ts
│   ├── package.json
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts          # React Query hooks
    │   ├── components/
    │   │   ├── ArticleCard.tsx
    │   │   ├── ArticleDetail.tsx
    │   │   ├── ChatPanel.tsx
    │   │   ├── SourceFilter.tsx
    │   │   └── ScrapeButton.tsx
    │   ├── pages/
    │   │   ├── Feed.tsx
    │   │   └── ArticlePage.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── Dockerfile
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/Dockerfile`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/Dockerfile`
- Create: `frontend/nginx.conf`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: fakeNews
      POSTGRES_PASSWORD: fakeNews123
      POSTGRES_DB: fakeNews
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fakeNews"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://fakeNews:fakeNews123@postgres:5432/fakeNews
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

- [ ] **Step 2: Create .env.example**

```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://fakeNews:fakeNews123@localhost:5432/fakeNews
```

- [ ] **Step 3: Create api/package.json**

```json
{
  "name": "fake-news-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "fastify": "^5.2.0",
    "@fastify/cors": "^10.0.0",
    "drizzle-orm": "^0.38.0",
    "postgres": "^3.4.0",
    "openai": "^4.0.0",
    "feed-parser": "^2.0.0",
    "axios": "^1.7.0",
    "uuid": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "drizzle-kit": "^0.30.0"
  }
}
```

- [ ] **Step 4: Create api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5: Create api/Dockerfile**

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

- [ ] **Step 6: Create frontend/package.json**

```json
{
  "name": "fake-news-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

- [ ] **Step 7: Create frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 8: Create frontend/vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://api:3000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 9: Create frontend/tailwind.config.js**

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
}
```

- [ ] **Step 10: Create frontend/postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 11: Create frontend/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fake News Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 12: Create frontend/Dockerfile**

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 13: Create frontend/nginx.conf**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://api:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] **Step 14: Commit**

```bash
git add docker-compose.yml .env.example api/package.json api/tsconfig.json api/Dockerfile frontend/package.json frontend/tsconfig.json frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/Dockerfile frontend/nginx.conf
git commit -m "feat: project scaffold with Docker setup"
```

---

## Task 2: Database Schema

**Files:**
- Create: `api/src/db/schema.ts`
- Create: `api/src/db/index.ts`
- Create: `api/src/db/migrate.ts`
- Create: `api/drizzle.config.ts`

- [ ] **Step 1: Create api/src/db/schema.ts**

```typescript
import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').references(() => sources.id).notNull(),
  originalTitle: text('original_title').notNull(),
  originalDescription: text('original_description'),
  originalUrl: text('original_url'),
  fakeTitle: text('fake_title'),
  fakeDescription: text('fake_description'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id').references(() => articles.id).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert
export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
```

- [ ] **Step 2: Create api/src/db/index.ts**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString)
export const db = drizzle(client, { schema })
```

- [ ] **Step 3: Create api/src/db/migrate.ts**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const connectionString = process.env.DATABASE_URL!

async function runMigrations() {
  const client = postgres(connectionString, { max: 1 })
  const db = drizzle(client)
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  await client.end()
  console.log('Migrations complete')
}

runMigrations().catch(console.error)
```

- [ ] **Step 4: Create api/drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 5: Generate initial migration**

Run: `cd api && npm install && npm run db:generate`
Expected: Creates migration file in `src/db/migrations/`

- [ ] **Step 6: Commit**

```bash
git add api/src/db/ api/drizzle.config.ts api/package.json
git commit -m "feat(api): add database schema with Drizzle ORM"
```

---

## Task 3: Backend Services

**Files:**
- Create: `api/src/services/scraper.ts`
- Create: `api/src/services/transformer.ts`
- Create: `api/src/services/chat.ts`
- Create: `api/src/worker.ts`
- Create: `api/src/routes/scrape.ts`
- Create: `api/src/routes/articles.ts`
- Create: `api/src/routes/chat.ts`
- Create: `api/src/routes/sources.ts`
- Create: `api/src/routes/index.ts`
- Create: `api/src/index.ts`

- [ ] **Step 1: Create api/src/services/scraper.ts**

```typescript
import axios from 'axios'
import { parseString } from 'xml2js'
import { promisify } from 'util'
import { db } from '../db/index.js'
import { sources, articles } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const parseXml = promisify(parseString)

const RSS_FEEDS = [
  { name: 'New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
]

async function fetchRss(url: string): Promise<any> {
  const response = await axios.get(url, { timeout: 10000 })
  return parseXml(response.data)
}

export async function scrapeAll(): Promise<number> {
  let totalScraped = 0

  for (const feed of RSS_FEEDS) {
    let [sourceRecord] = await db
      .select()
      .from(sources)
      .where(eq(sources.url, feed.url))
      .limit(1)

    if (!sourceRecord) {
      [sourceRecord] = await db
        .insert(sources)
        .values({ name: feed.name, url: feed.url })
        .returning()
    }

    try {
      const parsed = await fetchRss(feed.url)
      const items = parsed?.rss?.channel?.[0]?.item || []

      for (const item of items) {
        const title = item.title?.[0] || ''
        const description = item.description?.[0] || ''
        const link = item.link?.[0] || ''
        const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]) : null

        const [existing] = await db
          .select()
          .from(articles)
          .where(eq(articles.originalUrl, link))
          .limit(1)

        if (!existing) {
          await db.insert(articles).values({
            sourceId: sourceRecord.id,
            originalTitle: title,
            originalDescription: description,
            originalUrl: link,
            publishedAt: pubDate,
            status: 'pending',
          })
          totalScraped++
        }
      }
    } catch (error) {
      console.error(`Failed to scrape ${feed.name}:`, error)
    }
  }

  return totalScraped
}
```

- [ ] **Step 2: Create api/src/services/transformer.ts**

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TRANSFORM_PROMPT = `You are a satirical news writer. Transform the following news article into a humorous, absurd fake news version while keeping it recognizable. Only change the title and description to be comedic/absurd, keeping the general topic and structure intact.

Original Title: {title}
Original Description: {description}

Write a funny fake version of this article:`

export async function transformArticle(
  originalTitle: string,
  originalDescription: string
): Promise<{ fakeTitle: string; fakeDescription: string }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a satirical news writer. Be creative and funny but not offensive.',
      },
      {
        role: 'user',
        content: TRANSFORM_PROMPT.replace('{title}', originalTitle).replace('{description}', originalDescription),
      },
    ],
    max_tokens: 500,
  })

  const text = completion.choices[0]?.message?.content || ''

  const lines = text.split('\n').filter((l) => l.trim())
  const fakeTitle = lines[0]?.replace(/^(Fake Title:|Title:)\s*/i, '').trim() || originalTitle
  const fakeDescription = lines.slice(1).join(' ').trim() || originalDescription

  return { fakeTitle, fakeDescription }
}
```

- [ ] **Step 3: Create api/src/services/chat.ts**

```typescript
import OpenAI from 'openai'
import { db } from '../db/index.js'
import { chatMessages, articles } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function askArticle(
  articleId: string,
  userMessage: string
): Promise<{ userMsg: any; assistantMsg: any }> {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1)

  if (!article) {
    throw new Error('Article not found')
  }

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.articleId, articleId))
    .orderBy(chatMessages.createdAt)

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are discussing a satirical fake news article. The original article was:
Title: ${article.originalTitle}
Description: ${article.originalDescription}

The fake version is:
Title: ${article.fakeTitle}
Description: ${article.fakeDescription}

Answer questions about this article helpfully.`,
    },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 500,
  })

  const assistantContent = completion.choices[0]?.message?.content || ''

  const [userMsg] = await db
    .insert(chatMessages)
    .values({ articleId, role: 'user', content: userMessage })
    .returning()

  const [assistantMsg] = await db
    .insert(chatMessages)
    .values({ articleId, role: 'assistant', content: assistantContent })
    .returning()

  return { userMsg, assistantMsg }
}

export async function getChatHistory(articleId: string) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.articleId, articleId))
    .orderBy(chatMessages.createdAt)
}
```

- [ ] **Step 4: Create api/src/worker.ts**

```typescript
import { db } from './db/index.js'
import { articles } from './db/schema.js'
import { eq } from 'drizzle-orm'
import { transformArticle } from './services/transformer.js'

const POLL_INTERVAL = 5000

export function startWorker() {
  console.log('Starting background worker...')

  setInterval(async () => {
    try {
      const pending = await db
        .select()
        .from(articles)
        .where(eq(articles.status, 'pending'))
        .limit(5)

      for (const article of pending) {
        try {
          const { fakeTitle, fakeDescription } = await transformArticle(
            article.originalTitle,
            article.originalDescription || ''
          )

          await db
            .update(articles)
            .set({
              fakeTitle,
              fakeDescription,
              status: 'transformed',
              updatedAt: new Date(),
            })
            .where(eq(articles.id, article.id))

          console.log(`Transformed article ${article.id}`)
        } catch (error) {
          console.error(`Failed to transform article ${article.id}:`, error)
          await db
            .update(articles)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(articles.id, article.id))
        }
      }
    } catch (error) {
      console.error('Worker poll error:', error)
    }
  }, POLL_INTERVAL)
}
```

- [ ] **Step 5: Create api/src/routes/scrape.ts**

```typescript
import { FastifyInstance } from 'fastify'
import { scrapeAll } from '../services/scraper.js'

export async function scrapeRoutes(fastify: FastifyInstance) {
  fastify.post('/api/scrape', async () => {
    const count = await scrapeAll()
    return { scraped: count }
  })
}
```

- [ ] **Step 6: Create api/src/routes/articles.ts**

```typescript
import { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { articles, sources, chatMessages } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export async function articlesRoutes(fastify: FastifyInstance) {
  fastify.get('/api/articles', async (request) => {
    const { source, status } = request.query as { source?: string; status?: string }

    let query = db
      .select({
        id: articles.id,
        originalTitle: articles.originalTitle,
        fakeTitle: articles.fakeTitle,
        fakeDescription: articles.fakeDescription,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        sourceName: sources.name,
        sourceId: sources.id,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))

    if (source) {
      query = query.where(eq(sources.id, source)) as any
    }
    if (status) {
      query = query.where(eq(articles.status, status)) as any
    }

    const results = await query.orderBy(articles.createdAt.desc())
    return { articles: results }
  })

  fastify.get('/api/articles/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const [article] = await db
      .select({
        id: articles.id,
        originalTitle: articles.originalTitle,
        originalDescription: articles.originalDescription,
        originalUrl: articles.originalUrl,
        fakeTitle: articles.fakeTitle,
        fakeDescription: articles.fakeDescription,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        sourceName: sources.name,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(eq(articles.id, id))
      .limit(1)

    if (!article) {
      reply.status(404)
      return { error: 'Article not found' }
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.articleId, id))
      .orderBy(chatMessages.createdAt)

    return { article, messages }
  })
}
```

- [ ] **Step 7: Create api/src/routes/chat.ts**

```typescript
import { FastifyInstance } from 'fastify'
import { askArticle, getChatHistory } from '../services/chat.js'

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.get('/api/articles/:id/chat', async (request) => {
    const { id } = request.params as { id: string }
    const messages = await getChatHistory(id)
    return { messages }
  })

  fastify.post('/api/articles/:id/chat', async (request) => {
    const { id } = request.params as { id: string }
    const { message } = request.body as { message: string }

    if (!message) {
      return { error: 'Message is required' }
    }

    await askArticle(id, message)
    const messages = await getChatHistory(id)
    return { messages }
  })
}
```

- [ ] **Step 8: Create api/src/routes/sources.ts**

```typescript
import { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { sources } from '../db/schema.js'

export async function sourcesRoutes(fastify: FastifyInstance) {
  fastify.get('/api/sources', async () => {
    const results = await db.select().from(sources)
    return { sources: results }
  })
}
```

- [ ] **Step 9: Create api/src/routes/index.ts**

```typescript
import { FastifyInstance } from 'fastify'
import { scrapeRoutes } from './scrape.js'
import { articlesRoutes } from './articles.js'
import { chatRoutes } from './chat.js'
import { sourcesRoutes } from './sources.js'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(scrapeRoutes)
  await fastify.register(articlesRoutes)
  await fastify.register(chatRoutes)
  await fastify.register(sourcesRoutes)
}
```

- [ ] **Step 10: Create api/src/index.ts**

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { registerRoutes } from './routes/index.js'
import { startWorker } from './worker.js'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: true,
})

await registerRoutes(fastify)

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server running at http://localhost:3000')
    startWorker()
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

- [ ] **Step 11: Install xml2js**

Run: `cd api && npm install xml2js && npm install -D @types/xml2js`

- [ ] **Step 12: Commit**

```bash
git add api/src/
git commit -m "feat(api): add services, worker, and routes"
```

---

## Task 4: Frontend

**Files:**
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/components/ArticleCard.tsx`
- Create: `frontend/src/components/ArticleDetail.tsx`
- Create: `frontend/src/components/ChatPanel.tsx`
- Create: `frontend/src/components/SourceFilter.tsx`
- Create: `frontend/src/components/ScrapeButton.tsx`
- Create: `frontend/src/pages/Feed.tsx`
- Create: `frontend/src/pages/ArticlePage.tsx`

- [ ] **Step 1: Create frontend/src/index.css**

```css
@import "tailwindcss";
```

- [ ] **Step 2: Create frontend/src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 3: Create frontend/src/App.tsx**

```tsx
import { Routes, Route } from 'react-router-dom'
import Feed from './pages/Feed'
import ArticlePage from './pages/ArticlePage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Fake News Generator</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create frontend/src/api/client.ts**

```typescript
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const api = axios.create({
  baseURL: '/api',
})

export interface Article {
  id: string
  originalTitle: string
  fakeTitle: string | null
  fakeDescription: string | null
  originalDescription: string | null
  originalUrl: string | null
  status: 'pending' | 'transformed' | 'failed'
  publishedAt: string | null
  createdAt: string
  sourceName: string | null
  sourceId: string | null
}

export interface ChatMessage {
  id: string
  articleId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Source {
  id: string
  name: string
  url: string
}

export function useArticles(source?: string, status?: string) {
  return useQuery({
    queryKey: ['articles', { source, status }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (source) params.append('source', source)
      if (status) params.append('status', status)
      const { data } = await api.get(`/articles?${params}`)
      return data.articles as Article[]
    },
  })
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data } = await api.get(`/articles/${id}`)
      return data as { article: Article; messages: ChatMessage[] }
    },
    enabled: !!id,
  })
}

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data } = await api.get('/sources')
      return data.sources as Source[]
    },
  })
}

export function useScrape() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/scrape')
      return data as { scraped: number }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useChat(articleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post(`/articles/${articleId}/chat`, { message })
      return data.messages as ChatMessage[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] })
    },
  })
}
```

- [ ] **Step 5: Create frontend/src/components/ArticleCard.tsx**

```tsx
import { Link } from 'react-router-dom'
import { Article } from '../api/client'

interface Props {
  article: Article
}

export default function ArticleCard({ article }: Props) {
  const title = article.status === 'transformed' ? article.fakeTitle : article.originalTitle
  const description = article.status === 'transformed' ? article.fakeDescription : article.originalDescription
  const isPending = article.status === 'pending'

  return (
    <Link
      to={`/article/${article.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
          {article.sourceName}
        </span>
        {isPending && (
          <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
            Processing...
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title || 'Untitled'}</h3>
      <p className="text-gray-600 text-sm line-clamp-2">
        {description || 'No description available'}
      </p>
      {article.publishedAt && (
        <p className="text-gray-400 text-xs mt-2">
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>
      )}
    </Link>
  )
}
```

- [ ] **Step 6: Create frontend/src/components/SourceFilter.tsx**

```tsx
import { Source } from '../api/client'

interface Props {
  sources: Source[]
  selected: string
  onChange: (id: string) => void
}

export default function SourceFilter({ sources, selected, onChange }: Props) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
    >
      <option value="">All Sources</option>
      {sources.map((source) => (
        <option key={source.id} value={source.id}>
          {source.name}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 7: Create frontend/src/components/ScrapeButton.tsx**

```tsx
import { useScrape } from '../api/client'

export default function ScrapeButton() {
  const scrape = useScrape()

  return (
    <button
      onClick={() => scrape.mutate()}
      disabled={scrape.isPending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
    >
      {scrape.isPending ? 'Scraping...' : 'Scrape Now'}
    </button>
  )
}
```

- [ ] **Step 8: Create frontend/src/components/ArticleDetail.tsx**

```tsx
import { useState } from 'react'
import { Article } from '../api/client'

interface Props {
  article: Article
}

export default function ArticleDetail({ article }: Props) {
  const [showOriginal, setShowOriginal] = useState(false)

  const title = showOriginal ? article.originalTitle : article.fakeTitle
  const description = showOriginal ? article.originalDescription : article.fakeDescription

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
          {article.sourceName}
        </span>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showOriginal ? 'Show Fake' : 'Show Original'}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title || 'Untitled'}</h1>

      <p className="text-gray-700 whitespace-pre-wrap">
        {description || 'No description available'}
      </p>

      {article.originalUrl && (
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          View Original Article
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 9: Create frontend/src/components/ChatPanel.tsx**

```tsx
import { useState, useRef, useEffect } from 'react'
import { ChatMessage, useChat } from '../api/client'

interface Props {
  articleId: string
  messages: ChatMessage[]
}

export default function ChatPanel({ articleId, messages }: Props) {
  const [input, setInput] = useState('')
  const chat = useChat(articleId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !chat.isPending) {
      chat.mutate(input.trim())
      setInput('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[500px]">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">Chat About This Article</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center">
            Ask questions about this article...
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this article..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={chat.isPending}
          />
          <button
            type="submit"
            disabled={chat.isPending || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {chat.isPending ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 10: Create frontend/src/pages/Feed.tsx**

```tsx
import { useState } from 'react'
import { useArticles, useSources } from '../api/client'
import ArticleCard from '../components/ArticleCard'
import SourceFilter from '../components/SourceFilter'
import ScrapeButton from '../components/ScrapeButton'

export default function Feed() {
  const [selectedSource, setSelectedSource] = useState('')
  const { data: articles, isLoading } = useArticles(selectedSource || undefined, 'transformed')
  const { data: sources } = useSources()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Latest Fake News</h2>
          {sources && (
            <SourceFilter
              sources={sources}
              selected={selectedSource}
              onChange={setSelectedSource}
            />
          )}
        </div>
        <ScrapeButton />
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {!isLoading && articles?.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No fake news yet. Click "Scrape Now" to fetch articles.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 11: Create frontend/src/pages/ArticlePage.tsx**

```tsx
import { useParams } from 'react-router-dom'
import { useArticle } from '../api/client'
import ArticleDetail from '../components/ArticleDetail'
import ChatPanel from '../components/ChatPanel'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useArticle(id!)

  if (isLoading) {
    return <p className="text-gray-500">Loading...</p>
  }

  if (error || !data) {
    return <p className="text-red-500">Article not found</p>
  }

  const { article, messages } = data

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ArticleDetail article={article} />
      </div>
      <div>
        <ChatPanel articleId={article.id} messages={messages} />
      </div>
    </div>
  )
}
```

- [ ] **Step 12: Commit**

```bash
git add frontend/src/
git commit -m "feat(frontend): add React UI with Tailwind"
```

---

## Task 5: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# Fake News Generator

Full-stack application that scrapes real news from RSS feeds, transforms them into satirical fake versions using OpenAI LLM, and provides a chat interface for Q&A about each article.

## Tech Stack

- **Backend:** Node.js, Fastify, TypeScript, Drizzle ORM
- **Frontend:** React, Vite, React Query, Tailwind CSS
- **Database:** PostgreSQL
- **LLM:** OpenAI GPT-4o-mini
- **Container:** Docker, nginx

## Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Setup

1. Clone the repository
2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
```

4. Start the application:

```bash
docker-compose up --build
```

5. Open http://localhost:8080

## Usage

1. Click **"Scrape Now"** to fetch articles from NYT, NPR, and The Guardian
2. Wait for articles to be transformed (they show "Processing..." initially)
3. Click any article to view the fake news version
4. Use the **chat panel** to ask questions about the article
5. Toggle between **"Show Original"** and **"Show Fake"** to compare

## Architecture

```
┌─────────────────────────────────────────┐
│          docker-compose                 │
│  ┌─────────┐  ┌──────────┐  ┌───────┐     │
│  │   api   │  │ frontend  │  │  pg   │    │
│  │ Fastify │  │  nginx    │  │   DB  │    │
│  └────┬────┘  └────┬─────┘  └───┬───┘    │
│       │            │            │        │
└───────┼────────────┼────────────┼────────┘
        └────────────┴────────────┘
```

- **api** service: REST API + background worker for LLM transformation
- **frontend** service: React app served by nginx
- **postgres** service: PostgreSQL database

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/scrape | Trigger RSS scraping |
| GET | /api/articles | List articles |
| GET | /api/articles/:id | Get article with chat |
| GET | /api/articles/:id/chat | Get chat history |
| POST | /api/articles/:id/chat | Send chat message |
| GET | /api/sources | List RSS sources |

## Development

### Backend

```bash
cd api
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
cd api
npm run db:generate  # Generate migrations
npm run db:migrate    # Apply migrations
```

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
```

---

## Spec Coverage Check

| Spec Section | Tasks |
|--------------|-------|
| News Scraper (RSS feeds) | Task 3 |
| Fake News Transformer (OpenAI) | Task 3 |
| News Website UI (feed, detail, filter) | Task 4 |
| Chat Interface | Task 3, 4 |
| Database schema | Task 2 |
| Docker setup | Task 1 |
| README | Task 5 |

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/`.**

Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
