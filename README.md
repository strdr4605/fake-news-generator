# Fake News Generator

Full-stack application that scrapes real news from RSS feeds, transforms them into satirical fake versions using OpenAI LLM, and provides a chat interface for Q&A.

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
docker compose up --build
```

5. Open http://localhost:8080

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 8080 | nginx serving React app |
| api | 3000 | Fastify REST API |
| postgres | 5432 | PostgreSQL database |

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

## Architecture

```
┌─────────────────────────────────────────┐
│          docker compose                 │
│  ┌─────────┐  ┌──────────┐  ┌───────┐  │
│  │   api   │  │ frontend  │  │  pg   │  │
│  │ Fastify │  │  nginx    │  │   DB  │  │
│  │ :3000   │  │  :8080    │  │ :5432 │  │
│  └────┬────┘  └────┬─────┘  └───┬───┘  │
│       │            │            │       │
└───────┼────────────┼────────────┼──────┘
        └────────────┴────────────┘
```

## Testing

After services are up:

```bash
# Trigger scraping
curl -X POST http://localhost:3000/api/scrape

# List articles
curl http://localhost:3000/api/articles

# List sources
curl http://localhost:3000/api/sources
```

## License

MIT
