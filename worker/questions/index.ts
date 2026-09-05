import { vValidator } from '@hono/valibot-validator'
import { and, count, eq } from 'drizzle-orm'
import { Hono, type Context, type Next } from 'hono'
import { csrf } from 'hono/csrf'
import * as v from 'valibot'

import { createAuth, isTrustedAuthOrigin } from '../auth'
import { createDatabase } from '../db/client'
import { question } from '../db/schema'
import { questionsMatchingSearch } from './utils/question-search'

const QUESTION_FIELD_MAX_LENGTH = 20_000

const MAX_QUESTIONS_PER_USER = 200

type QuestionsContext = {
  Bindings: Env
  Variables: {
    userId: string
  }
}

const questionListRow = {
  id: question.id,
  question: question.question,
}

const questionRow = {
  ...questionListRow,
  answer: question.answer,
}

type QuestionRow = Omit<typeof question.$inferSelect, 'userId'>

const questionFieldsSchema = v.object({
  question: v.pipe(
    v.string('Question must be a string'),
    v.trim(),
    v.minLength(1, 'Question is required'),
    v.maxLength(QUESTION_FIELD_MAX_LENGTH, 'Question is too long'),
  ),
  answer: v.pipe(
    v.string('Answer must be a string'),
    v.trim(),
    v.minLength(1, 'Answer is required'),
    v.maxLength(QUESTION_FIELD_MAX_LENGTH, 'Answer is too long'),
  ),
})

const questionIdSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
})

const questionSearchQuerySchema = v.object({
  q: v.optional(v.pipe(v.string(), v.trim())),
})

const ownedQuestion = (questionId: string, userId: string) =>
  and(eq(question.id, questionId), eq(question.userId, userId))

const requireSession = async (context: Context<QuestionsContext>, next: Next) => {
  const currentSession = await createAuth(context.env).api.getSession({
    headers: context.req.raw.headers,
  })

  if (!currentSession) {
    return context.json({ message: 'Unauthorized' }, 401)
  }

  context.set('userId', currentSession.user.id)
  await next()
}

const loadQuestion = async (
  database: ReturnType<typeof createDatabase>,
  questionId: string,
  userId: string,
): Promise<QuestionRow | null> => {
  const [foundQuestion] = await database
    .select(questionRow)
    .from(question)
    .where(ownedQuestion(questionId, userId))
    .limit(1)

  return foundQuestion ?? null
}

export const questions = new Hono<QuestionsContext>()
  .use(
    csrf({
      origin: (origin, context) =>
        isTrustedAuthOrigin(origin, context.env.BETTER_AUTH_URL),
    }),
  )
  .use(requireSession)
  .get('/', vValidator('query', questionSearchQuerySchema), async (context) => {
    const { q = '' } = context.req.valid('query')
    const database = createDatabase(context.env.DB)
    const loadedQuestions = await database
      .select(questionListRow)
      .from(question)
      .where(eq(question.userId, context.get('userId')))

    return context.json({ questions: questionsMatchingSearch(loadedQuestions, q) }, 200)
  })
  .get('/:id', vValidator('param', questionIdSchema), async (context) => {
    const { id: questionId } = context.req.valid('param')
    const database = createDatabase(context.env.DB)
    const foundQuestion = await loadQuestion(
      database,
      questionId,
      context.get('userId'),
    )

    if (!foundQuestion) {
      return context.json({ message: 'Question not found' }, 404)
    }

    return context.json(foundQuestion, 200)
  })
  .post('/', vValidator('json', questionFieldsSchema), async (context) => {
    const questionFields = context.req.valid('json')
    const database = createDatabase(context.env.DB)
    const userId = context.get('userId')
    const [questionTotal] = await database
      .select({ questionCount: count() })
      .from(question)
      .where(eq(question.userId, userId))

    if ((questionTotal?.questionCount ?? 0) >= MAX_QUESTIONS_PER_USER) {
      return context.json({ message: 'Question limit reached' }, 400)
    }

    const [createdQuestion] = await database
      .insert(question)
      .values({
        id: crypto.randomUUID(),
        question: questionFields.question,
        answer: questionFields.answer,
        userId,
      })
      .returning(questionRow)

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
        .where(ownedQuestion(questionId, context.get('userId')))
        .returning(questionRow)

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
      .where(ownedQuestion(questionId, context.get('userId')))
      .returning(questionRow)

    if (!deletedQuestion) {
      return context.json({ message: 'Question not found' }, 404)
    }

    return context.body(null, 204)
  })
