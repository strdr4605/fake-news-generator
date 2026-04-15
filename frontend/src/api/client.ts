import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export async function fetchArticles(page: number, limit = 20) {
  const offset = page * limit
  const { data } = await api.get('/articles', { params: { limit, offset } })
  return data
}

export async function fetchSources() {
  const { data } = await api.get('/sources')
  return data
}

export async function fetchArticle(id: string) {
  const { data } = await api.get(`/articles/${id}`)
  return data
}

export async function fetchChat(articleId: string) {
  const { data } = await api.get(`/articles/${articleId}/chat`)
  return data
}

export async function sendChatMessage(articleId: string, message: string) {
  const { data } = await api.post(`/articles/${articleId}/chat`, { message })
  return data
}

export async function triggerScrape() {
  const { data } = await api.post('/scrape')
  return data
}

export default api
