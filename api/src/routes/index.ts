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