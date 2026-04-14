import OpenAI from 'openai'
import { db } from '../db/index.js'
import { chatMessages, articles } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function askArticle(
  articleId: string,
  userMessage: string
): Promise<{ userMsg: any; assistantMsg: any }> {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1)

  if (!article) {
    throw new Error('Article not found')
  }

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.articleId, articleId))
    .orderBy(chatMessages.createdAt)

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are discussing a satirical fake news article. The original article was:
Title: ${article.originalTitle}
Description: ${article.originalDescription}

The fake version is:
Title: ${article.fakeTitle}
Description: ${article.fakeDescription}

Answer questions about this article helpfully.`,
    },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 500,
  })

  const assistantContent = completion.choices[0]?.message?.content || ''

  const [userMsg] = await db
    .insert(chatMessages)
    .values({ articleId, role: 'user', content: userMessage })
    .returning()

  const [assistantMsg] = await db
    .insert(chatMessages)
    .values({ articleId, role: 'assistant', content: assistantContent })
    .returning()

  return { userMsg, assistantMsg }
}

export async function getChatHistory(articleId: string) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.articleId, articleId))
    .orderBy(chatMessages.createdAt)
}