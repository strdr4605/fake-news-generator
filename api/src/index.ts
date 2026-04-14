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