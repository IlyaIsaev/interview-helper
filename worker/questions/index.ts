import { vValidator } from "@hono/valibot-validator";
import { and, count, eq } from "drizzle-orm";
import { Hono, type Context, type Next } from "hono";
import { csrf } from "hono/csrf";
import * as v from "valibot";

import { createAuth, isTrustedAuthOrigin } from "../auth";
import { createDatabase } from "../db/client";
import { publishedQuestion, question } from "../db/schema";
import { questionsMatchingSearch } from "./utils/question-search";

const QUESTION_FIELD_MAX_LENGTH = 20_000;

const MAX_QUESTIONS_PER_USER = 200;

type QuestionsContext = {
  Bindings: Env;
  Variables: {
    userId: string;
  };
};

const questionRow = {
  id: question.id,
  question: question.question,
  answer: question.answer,
};

type Question = Omit<typeof question.$inferSelect, "userId">;

const questionFieldsSchema = v.object({
  question: v.pipe(
    v.string("Question must be a string"),
    v.trim(),
    v.minLength(1, "Question is required"),
    v.maxLength(QUESTION_FIELD_MAX_LENGTH, "Question is too long"),
  ),
  answer: v.pipe(
    v.string("Answer must be a string"),
    v.trim(),
    v.minLength(1, "Answer is required"),
    v.maxLength(QUESTION_FIELD_MAX_LENGTH, "Answer is too long"),
  ),
});

const questionIdSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
});

const questionSearchQuerySchema = v.object({
  q: v.optional(v.pipe(v.string(), v.trim())),
});

const ownedQuestion = (questionId: string, userId: string) =>
  and(eq(question.id, questionId), eq(question.userId, userId));

const requireSession = async (context: Context<QuestionsContext>, next: Next) => {
  const currentSession = await createAuth(context.env).api.getSession({
    headers: context.req.raw.headers,
  });

  if (!currentSession) return context.json({ message: "Unauthorized" }, 401);

  context.set("userId", currentSession.user.id);

  await next();
};

const sessionUserId = async (context: Context<QuestionsContext>): Promise<string | null> => {
  const currentSession = await createAuth(context.env).api.getSession({
    headers: context.req.raw.headers,
  });

  return currentSession?.user.id ?? null;
};

const listedQuestionRow = {
  id: question.id,
  question: question.question,
};

const listedPublishedQuestionRow = {
  id: publishedQuestion.id,
  question: publishedQuestion.question,
};

const publishedQuestionRow = {
  id: publishedQuestion.id,
  question: publishedQuestion.question,
  answer: publishedQuestion.answer,
};

const loadQuestion = async (
  database: ReturnType<typeof createDatabase>,
  questionId: string,
  userId: string,
): Promise<Question | null> => {
  const [foundQuestion] = await database
    .select(questionRow)
    .from(question)
    .where(ownedQuestion(questionId, userId))
    .limit(1);

  return foundQuestion ?? null;
};

const loadPublishedQuestion = async (
  database: ReturnType<typeof createDatabase>,
  questionId: string,
): Promise<Question | null> => {
  const [foundQuestion] = await database
    .select(publishedQuestionRow)
    .from(publishedQuestion)
    .where(eq(publishedQuestion.id, questionId))
    .limit(1);

  return foundQuestion ?? null;
};

export const questions = new Hono<QuestionsContext>()
  .use(
    csrf({
      origin: (origin, context) => isTrustedAuthOrigin(origin, context.env.BETTER_AUTH_URL),
    }),
  )
  .get("/", vValidator("query", questionSearchQuerySchema), async (context) => {
    const { q = "" } = context.req.valid("query");
    const userId = await sessionUserId(context);
    const database = createDatabase(context.env.DB);

    if (userId) {
      const loadedQuestions = await database
        .select(listedQuestionRow)
        .from(question)
        .where(eq(question.userId, userId));

      return context.json({ questions: questionsMatchingSearch(loadedQuestions, q) }, 200);
    }

    const loadedQuestions = await database
      .select(listedPublishedQuestionRow)
      .from(publishedQuestion);

    return context.json({ questions: questionsMatchingSearch(loadedQuestions, q) }, 200);
  })
  .get("/:id", vValidator("param", questionIdSchema), async (context) => {
    const { id: questionId } = context.req.valid("param");
    const userId = await sessionUserId(context);
    const database = createDatabase(context.env.DB);

    const foundQuestion = userId
      ? await loadQuestion(database, questionId, userId)
      : await loadPublishedQuestion(database, questionId);

    if (!foundQuestion) return context.json({ message: "Question not found" }, 404);

    return context.json(foundQuestion, 200);
  })
  .post("/", requireSession, vValidator("json", questionFieldsSchema), async (context) => {
    const questionFields = context.req.valid("json");
    const database = createDatabase(context.env.DB);
    const userId = context.get("userId");

    const [questionTotal] = await database
      .select({ questionCount: count() })
      .from(question)
      .where(eq(question.userId, userId));

    if ((questionTotal?.questionCount ?? 0) >= MAX_QUESTIONS_PER_USER)
      return context.json({ message: "Question limit reached" }, 400);

    const [createdQuestion] = await database
      .insert(question)
      .values({
        id: crypto.randomUUID(),
        question: questionFields.question,
        answer: questionFields.answer,
        userId,
      })
      .returning(questionRow);

    return context.json(createdQuestion, 201);
  })
  .put(
    "/:id",
    requireSession,
    vValidator("param", questionIdSchema),
    vValidator("json", questionFieldsSchema),
    async (context) => {
      const { id: questionId } = context.req.valid("param");
      const questionFields = context.req.valid("json");
      const database = createDatabase(context.env.DB);

      const [updatedQuestion] = await database
        .update(question)
        .set({
          question: questionFields.question,
          answer: questionFields.answer,
        })
        .where(ownedQuestion(questionId, context.get("userId")))
        .returning(questionRow);

      if (!updatedQuestion) return context.json({ message: "Question not found" }, 404);

      return context.json(updatedQuestion, 200);
    },
  )
  .post(
    "/:id/publish",
    requireSession,
    vValidator("param", questionIdSchema),
    async (context) => {
      const { id: questionId } = context.req.valid("param");
      const database = createDatabase(context.env.DB);
      const ownedQuestionRow = await loadQuestion(database, questionId, context.get("userId"));

      if (!ownedQuestionRow) return context.json({ message: "Question not found" }, 404);

      await database
        .insert(publishedQuestion)
        .values(ownedQuestionRow)
        .onConflictDoUpdate({
          target: publishedQuestion.id,
          set: {
            question: ownedQuestionRow.question,
            answer: ownedQuestionRow.answer,
          },
        });

      return context.body(null, 204);
    },
  )
  .delete("/:id", requireSession, vValidator("param", questionIdSchema), async (context) => {
    const { id: questionId } = context.req.valid("param");
    const database = createDatabase(context.env.DB);

    const [deletedQuestion] = await database
      .delete(question)
      .where(ownedQuestion(questionId, context.get("userId")))
      .returning(questionRow);

    if (!deletedQuestion) return context.json({ message: "Question not found" }, 404);

    await database.delete(publishedQuestion).where(eq(publishedQuestion.id, questionId));

    return context.body(null, 204);
  });
