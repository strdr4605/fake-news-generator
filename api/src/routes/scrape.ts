import { FastifyInstance } from 'fastify'
import { scrapeAll } from '../services/scraper.js'

export async function scrapeRoutes(fastify: FastifyInstance) {
  fastify.post('/scrape', async () => {
    const count = await scrapeAll()
    return { scraped: count }
  })
}