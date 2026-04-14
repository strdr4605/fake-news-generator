import { FastifyInstance } from 'fastify'
import { scrapeRoutes } from './scrape.js'
import { articlesRoutes } from './articles.js'
import { chatRoutes } from './chat.js'
import { sourcesRoutes } from './sources.js'

export async function registerRoutes(fastify: FastifyInstance) {
  await fastify.register(
    async (f) => {
      await f.register(scrapeRoutes)
      await f.register(articlesRoutes)
      await f.register(chatRoutes)
      await f.register(sourcesRoutes)
    },
    { prefix: '/api/v1' }
  )
}