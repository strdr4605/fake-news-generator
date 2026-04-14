import { FastifyInstance } from 'fastify'
import { askArticle, getChatHistory } from '../services/chat.js'

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.get('/articles/:id/chat', async (request) => {
    const { id } = request.params as { id: string }
    const messages = await getChatHistory(id)
    return { messages }
  })

  fastify.post('/articles/:id/chat', async (request) => {
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