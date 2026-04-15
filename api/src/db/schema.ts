import { pgTable, uuid, text, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core'

export const articleStatusEnum = pgEnum('article_status', ['pending', 'transformed', 'failed'])
export const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant'])

export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  fakeName: varchar('fake_name', { length: 255 }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').references(() => sources.id).notNull(),
  originalTitle: text('original_title').notNull(),
  originalDescription: text('original_description'),
  originalUrl: text('original_url'),
  fakeTitle: text('fake_title'),
  fakeDescription: text('fake_description'),
  status: articleStatusEnum('status').notNull().default('pending'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  articleId: uuid('article_id').references(() => articles.id).notNull(),
  role: chatRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Source = typeof sources.$inferSelect
export type NewSource = typeof sources.$inferInsert
export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert