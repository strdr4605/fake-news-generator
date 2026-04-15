import OpenAI from 'openai'

let _openai: OpenAI | undefined

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

const TRANSFORM_PROMPT = `Given the following news article, create a satirical fake version.

Original Title: {title}
Original Description: {description}

Respond EXACTLY in this format (no other text):
Line 1: <your fake title>
Line 2 onwards: <your fake description as HTML paragraphs>`

export async function transformArticle(
  originalTitle: string,
  originalDescription: string
): Promise<{ fakeTitle: string; fakeDescription: string }> {
  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a satirical news writer. Keep responses short, funny, and in the exact format requested.',
      },
      {
        role: 'user',
        content: TRANSFORM_PROMPT.replace('{title}', originalTitle).replace('{description}', originalDescription),
      },
    ],
    max_tokens: 1000,
  })

  const text = completion.choices[0]?.message?.content || ''

  const lines = text.split('\n').filter((l) => l.trim())
  let fakeTitle = (lines[0] || originalTitle).replace(/^(?:Line \d+:\s*)+/, '').trim()
  if (!fakeTitle) fakeTitle = originalTitle
  let fakeDescription = lines.slice(1).join('\n').replace(/(?:^Line \d+:\s*)+/gm, '').trim()
  if (!fakeDescription) fakeDescription = originalDescription

  return { fakeTitle, fakeDescription }
}