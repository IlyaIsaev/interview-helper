import { vValidator } from '@hono/valibot-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import * as v from 'valibot'

import { createDatabase } from './db/client'
import { question } from './db/schema'

type Question = typeof question.$inferSelect

const questionFieldsSchema = v.object({
  question: v.pipe(
    v.string('Question must be a string'),
    v.trim(),
    v.minLength(1, 'Question is required'),
  ),
  answer: v.pipe(
    v.string('Answer must be a string'),
    v.trim(),
    v.minLength(1, 'Answer is required'),
  ),
})

const questionIdSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
})

const loadQuestion = async (
  database: ReturnType<typeof createDatabase>,
  questionId: string,
): Promise<Question | null> => {
  const [foundQuestion] = await database
    .select()
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1)

  return foundQuestion ?? null
}

export const questions = new Hono<{ Bindings: Env }>()
  .get('/', async (context) => {
    const database = createDatabase(context.env.DB)
    const questions = await database.select().from(question)

    return context.json({ questions }, 200)
  })
  .get('/:id', vValidator('param', questionIdSchema), async (context) => {
    const { id: questionId } = context.req.valid('param')
    const database = createDatabase(context.env.DB)
    const foundQuestion = await loadQuestion(database, questionId)

    if (!foundQuestion) {
      return context.json({ message: 'Question not found' }, 404)
    }

    return context.json(foundQuestion, 200)
  })
  .post('/', vValidator('json', questionFieldsSchema), async (context) => {
    const questionFields = context.req.valid('json')
    const database = createDatabase(context.env.DB)
    const [createdQuestion] = await database
      .insert(question)
      .values({
        id: crypto.randomUUID(),
        question: questionFields.question,
        answer: questionFields.answer,
      })
      .returning()

    return context.json(createdQuestion, 201)
  })
  .put(
    '/:id',
    vValidator('param', questionIdSchema),
    vValidator('json', questionFieldsSchema),
    async (context) => {
      const { id: questionId } = context.req.valid('param')
      const questionFields = context.req.valid('json')
      const database = createDatabase(context.env.DB)
      const [updatedQuestion] = await database
        .update(question)
        .set({
          question: questionFields.question,
          answer: questionFields.answer,
        })
        .where(eq(question.id, questionId))
        .returning()

      if (!updatedQuestion) {
        return context.json({ message: 'Question not found' }, 404)
      }

      return context.json(updatedQuestion, 200)
    },
  )
  .delete('/:id', vValidator('param', questionIdSchema), async (context) => {
    const { id: questionId } = context.req.valid('param')
    const database = createDatabase(context.env.DB)
    const [deletedQuestion] = await database
      .delete(question)
      .where(eq(question.id, questionId))
      .returning()

    if (!deletedQuestion) {
      return context.json({ message: 'Question not found' }, 404)
    }

    return context.body(null, 204)
  })
