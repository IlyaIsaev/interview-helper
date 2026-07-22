import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const interviewQuestions = sqliteTable("interview-questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});
