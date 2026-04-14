import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TRANSFORM_PROMPT = `You are a satirical news writer. Transform the following news article into a humorous, absurd fake news version while keeping it recognizable. Only change the title and description to be comedic/absurd, keeping the general topic and structure intact.

Original Title: {title}
Original Description: {description}

Write a funny fake version of this article:`

export async function transformArticle(
  originalTitle: string,
  originalDescription: string
): Promise<{ fakeTitle: string; fakeDescription: string }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a satirical news writer. Be creative and funny but not offensive.',
      },
      {
        role: 'user',
        content: TRANSFORM_PROMPT.replace('{title}', originalTitle).replace('{description}', originalDescription),
      },
    ],
    max_tokens: 500,
  })

  const text = completion.choices[0]?.message?.content || ''

  const lines = text.split('\n').filter((l) => l.trim())
  const fakeTitle = lines[0]?.replace(/^(Fake Title:|Title:)\s*/i, '').trim() || originalTitle
  const fakeDescription = lines.slice(1).join(' ').trim() || originalDescription

  return { fakeTitle, fakeDescription }
}