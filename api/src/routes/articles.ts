import { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { articles, sources, chatMessages } from '../db/schema.js'
import { eq, desc, and } from 'drizzle-orm'

export async function articlesRoutes(fastify: FastifyInstance) {
  fastify.get('/articles', async (request) => {
    const { source, status } = request.query as { source?: string; status?: string }

    const conditions = []
    if (source) conditions.push(eq(sources.id, source))
    if (status) conditions.push(eq(articles.status, status as any))

    const results = await db
      .select({
        id: articles.id,
        originalTitle: articles.originalTitle,
        fakeTitle: articles.fakeTitle,
        fakeDescription: articles.fakeDescription,
        originalDescription: articles.originalDescription,
        originalUrl: articles.originalUrl,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        sourceName: sources.name,
        sourceFakeName: sources.fakeName,
        sourceId: sources.id,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(articles.createdAt))

    const articlesWithFallback = results.map(a => ({
      ...a,
      sourceName: a.sourceFakeName || a.sourceName,
      fakeTitle: a.fakeTitle || a.originalTitle,
      fakeDescription: a.fakeDescription || a.originalDescription,
    }))

    return { articles: articlesWithFallback }
  })

  fastify.get('/articles/:id', async (request, reply) => {
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
        sourceFakeName: sources.fakeName,
      })
      .from(articles)
      .leftJoin(sources, eq(articles.sourceId, sources.id))
      .where(eq(articles.id, id))
      .limit(1)

    if (!article) {
      reply.status(404)
      return { error: 'Article not found' }
    }

    const articleWithFallback = {
      ...article,
      sourceName: article.sourceFakeName || article.sourceName,
      fakeTitle: article.fakeTitle || article.originalTitle,
      fakeDescription: article.fakeDescription || article.originalDescription,
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.articleId, id))
      .orderBy(chatMessages.createdAt)

    return { article: articleWithFallback, messages }
  })
}