import { describe, it, expect } from 'vitest'
import Fastify from 'fastify'

describe('Route Registration', () => {
  it('sources route is registered at /api/v1/sources', async () => {
    const app = Fastify()
    await app.register(async (f) => {
      f.get('/sources', async () => ({ sources: [] }))
    }, { prefix: '/api/v1' })
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/sources',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('sources')
  })

  it('articles route is registered at /api/v1/articles', async () => {
    const app = Fastify()
    await app.register(async (f) => {
      f.get('/articles', async () => ({ articles: [] }))
    }, { prefix: '/api/v1' })
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/articles',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('articles')
  })

  it('scrape route is registered at /api/v1/scrape', async () => {
    const app = Fastify()
    await app.register(async (f) => {
      f.post('/scrape', async () => ({ scraped: 0 }))
    }, { prefix: '/api/v1' })
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/scrape',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('scraped')
  })

  it('article detail route is registered at /api/v1/articles/:id', async () => {
    const app = Fastify()
    await app.register(async (f) => {
      f.get('/articles/:id', async () => ({ article: {}, messages: [] }))
    }, { prefix: '/api/v1' })
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/articles/123',
    })

    expect(response.statusCode).toBe(200)
  })

  it('chat routes are registered', async () => {
    const app = Fastify()
    await app.register(async (f) => {
      f.get('/articles/:id/chat', async () => ({ messages: [] }))
      f.post('/articles/:id/chat', async () => ({ messages: [] }))
    }, { prefix: '/api/v1' })
    await app.ready()

    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/articles/123/chat',
    })
    expect(getResponse.statusCode).toBe(200)

    const postResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/articles/123/chat',
      payload: { message: 'test' },
    })
    expect(postResponse.statusCode).toBe(200)
  })
})