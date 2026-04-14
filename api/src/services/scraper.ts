import axios from 'axios'
import { parseString } from 'xml2js'
import { promisify } from 'util'
import { db } from '../db/index.js'
import { sources, articles } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const parseXml = promisify(parseString)

async function fetchRss(url: string): Promise<any> {
  const response = await axios.get(url, { timeout: 10000 })
  return parseXml(response.data)
}

export async function scrapeAll(): Promise<number> {
  const allSources = await db.select().from(sources)
  let totalScraped = 0

  for (const sourceRecord of allSources) {
    try {
      const parsed = await fetchRss(sourceRecord.url)
      const items = parsed?.rss?.channel?.[0]?.item || []

      for (const item of items) {
        const title = item.title?.[0] || ''
        const description = item.description?.[0] || ''
        const link = item.link?.[0] || ''
        const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]) : null

        const [existing] = await db
          .select()
          .from(articles)
          .where(eq(articles.originalUrl, link))
          .limit(1)

        if (!existing) {
          await db.insert(articles).values({
            sourceId: sourceRecord.id,
            originalTitle: title,
            originalDescription: description,
            originalUrl: link,
            publishedAt: pubDate,
            status: 'pending',
          })
          totalScraped++
        }
      }
    } catch (error) {
      console.error(`Failed to scrape ${sourceRecord.name}:`, error)
    }
  }

  return totalScraped
}