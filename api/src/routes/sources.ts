import { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { sources } from '../db/schema.js'

export async function sourcesRoutes(fastify: FastifyInstance) {
  fastify.get('/sources', async () => {
    const results = await db.select().from(sources)
    return { sources: results }
  })
}