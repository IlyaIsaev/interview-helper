import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import * as v from 'valibot'

import { createDatabase } from './db/client'
import { question } from './db/schema'

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

const parseQuestionFields = (body: unknown) => {
  const parsedQuestion = v.safeParse(questionFieldsSchema, body)

  if (!parsedQuestion.success) {
    return {
      questionFields: null,
      message: parsedQuestion.issues[0]?.message ?? 'Invalid question',
    }
  }

  return {
    questionFields: parsedQuestion.output,
    message: null,
  }
}

const loadQuestion = async (
  database: ReturnType<typeof createDatabase>,
  questionId: string,
) => {
  const [foundQuestion] = await database
    .select()
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1)

  return foundQuestion ?? null
}

export const questions = new Hono<{ Bindings: Env }>()

questions.get('/', async (context) => {
  const database = createDatabase(context.env.DB)
  const questionRows = await database.select().from(question)

  return context.json({ questions: questionRows })
})

questions.get('/:id', async (context) => {
  const database = createDatabase(context.env.DB)
  const foundQuestion = await loadQuestion(database, context.req.param('id'))

  if (!foundQuestion) {
    return context.json({ message: 'Question not found' }, 404)
  }

  return context.json(foundQuestion)
})

questions.post('/', async (context) => {
  const body = await context.req.json().catch(() => null)
  const { questionFields, message } = parseQuestionFields(body)

  if (!questionFields) {
    return context.json({ message }, 400)
  }

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

questions.put('/:id', async (context) => {
  const body = await context.req.json().catch(() => null)
  const { questionFields, message } = parseQuestionFields(body)

  if (!questionFields) {
    return context.json({ message }, 400)
  }

  const database = createDatabase(context.env.DB)
  const [updatedQuestion] = await database
    .update(question)
    .set({
      question: questionFields.question,
      answer: questionFields.answer,
    })
    .where(eq(question.id, context.req.param('id')))
    .returning()

  if (!updatedQuestion) {
    return context.json({ message: 'Question not found' }, 404)
  }

  return context.json(updatedQuestion)
})

questions.delete('/:id', async (context) => {
  const database = createDatabase(context.env.DB)
  const [deletedQuestion] = await database
    .delete(question)
    .where(eq(question.id, context.req.param('id')))
    .returning()

  if (!deletedQuestion) {
    return context.json({ message: 'Question not found' }, 404)
  }

  return context.body(null, 204)
})
