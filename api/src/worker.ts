import { db } from './db/index.js'
import { articles } from './db/schema.js'
import { eq } from 'drizzle-orm'
import { transformArticle } from './services/transformer.js'

const POLL_INTERVAL = 5000

export function startWorker() {
  console.log('Starting background worker...')

  setInterval(async () => {
    try {
      const pending = await db
        .select()
        .from(articles)
        .where(eq(articles.status, 'pending'))
        .limit(5)

      for (const article of pending) {
        try {
          const { fakeTitle, fakeDescription } = await transformArticle(
            article.originalTitle,
            article.originalDescription || ''
          )

          await db
            .update(articles)
            .set({
              fakeTitle,
              fakeDescription,
              status: 'transformed',
              updatedAt: new Date(),
            })
            .where(eq(articles.id, article.id))

          console.log(`Transformed article ${article.id}`)
        } catch (error) {
          console.error(`Failed to transform article ${article.id}:`, error)
          await db
            .update(articles)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(articles.id, article.id))
        }
      }
    } catch (error) {
      console.error('Worker poll error:', error)
    }
  }, POLL_INTERVAL)
}