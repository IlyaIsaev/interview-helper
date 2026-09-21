import { action, atom, reatomString, withAbort, wrap } from "@reatom/core";
import { filter, flatten, map, pick, pipe, sortBy } from "es-toolkit/fp";
import type { DeepReadonly } from "es-toolkit/types";

import { clientApi } from "@/shared/api";
import { markdownPlainText } from "@/shared/lib";

import { initQuestion, openedQuestionId } from "./question";

export type Question = DeepReadonly<{
  id: string;
  question: string;
}>;

export const questions = atom<ReadonlyArray<Question> | null>(null, "questions");

export const questionsQuery = reatomString("", "questionsQuery");

const questionSortKey = (question: Question) => markdownPlainText(question.question).toLowerCase();

const sortedQuestions = (nextQuestions: ReadonlyArray<Question>): ReadonlyArray<Question> =>
  pipe(nextQuestions, map(pick(["id", "question"])), sortBy([questionSortKey]));

export const initQuestions = action((nextQuestions: ReadonlyArray<Question>) => {
  questions.set(sortedQuestions(nextQuestions));
}, "initQuestions");

export const resetQuestions = action(() => {
  questions.set(null);

  questionsQuery.set("");

  openedQuestionId.set("");

  initQuestion(null);
}, "resetQuestions");

export const addToQuestions = action((question: Question) => {
  questions.set(sortedQuestions(pipe([questions() ?? [], [question]], flatten())));
}, "addToQuestions");

export const updateInQuestions = action((nextQuestion: Question) => {
  const replaceQuestion = (question: Question) =>
    question.id === nextQuestion.id ? nextQuestion : question;

  questions.set(sortedQuestions(pipe(questions() ?? [], map(replaceQuestion))));
}, "updateInQuestions");

export const removeFromQuestions = action((questionId: string) => {
  const isOtherQuestion = (question: Question) => question.id !== questionId;

  questions.set(pipe(questions() ?? [], filter(isOtherQuestion)));
}, "removeFromQuestions");

export const restoreToQuestions = action((question: Question, atIndex: number) => {
  questions.set(sortedQuestions((questions() ?? []).toSpliced(atIndex, 0, question)));
}, "restoreToQuestions");

export const refetchQuestions = action(async () => {
  try {
    const { questions: nextQuestions } = await wrap(clientApi.loadQuestions(questionsQuery()));

    initQuestions(nextQuestions);
  } catch {
    return;
  }
}, "refetchQuestions").extend(withAbort());
