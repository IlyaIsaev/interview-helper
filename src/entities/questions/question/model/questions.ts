import { action, computed, reatomString, sleep, urlAtom, withAsyncData, wrap } from "@reatom/core";
import { filter, flatten, map, pick, pipe, sortBy } from "es-toolkit/fp";
import type { DeepReadonly } from "es-toolkit/types";

import { clientApi } from "@/shared/api";
import { session } from "@/shared/auth";
import { THEORY_PATH } from "@/shared/config";
import { markdownPlainText } from "@/shared/lib";

export type Question = DeepReadonly<{
  id: string;
  question: string;
}>;

export const questionSearch = reatomString("", "questionSearch");

export const theoryQuestionSearch = reatomString("", "theoryQuestionSearch");

const questionSortKey = (question: Question) => markdownPlainText(question.question).toLowerCase();

const sortedQuestions = (nextQuestions: ReadonlyArray<Question>): ReadonlyArray<Question> =>
  pipe(nextQuestions, map(pick(["id", "question"])), sortBy([questionSortKey]));

export const activeQuestionsQuery = computed(() => {
  const search = urlAtom().pathname === THEORY_PATH ? theoryQuestionSearch() : questionSearch();

  return search.trim();
}, "activeQuestionsQuery");

const waitUntilSessionSettles = async () => {
  if (session.ready()) return;

  await wrap(new Promise<never>(() => {}));
};

export const questions = computed(async () => {
  const signedInUserId = session.data()?.user?.id ?? null;

  await waitUntilSessionSettles();

  const query = activeQuestionsQuery();

  if (query.length > 0) await wrap(sleep(300));

  if ((session.data()?.user?.id ?? null) !== signedInUserId) return null;

  const { questions: nextQuestions } = await wrap(clientApi.loadQuestions(query));

  return sortedQuestions(nextQuestions);
}, "questions").extend(withAsyncData({ initState: null as ReadonlyArray<Question> | null }));

export const resetQuestions = action(() => {
  questionSearch.reset();

  theoryQuestionSearch.reset();

  questions.data.set(null);
}, "resetQuestions");

export const addToQuestions = action((question: Question) => {
  questions.data.set(sortedQuestions(pipe([questions.data() ?? [], [question]], flatten())));
}, "addToQuestions");

export const updateInQuestions = action((nextQuestion: Question) => {
  const replaceQuestion = (question: Question) =>
    question.id === nextQuestion.id ? nextQuestion : question;

  questions.data.set(sortedQuestions(pipe(questions.data() ?? [], map(replaceQuestion))));
}, "updateInQuestions");

export const removeFromQuestions = action((questionId: string) => {
  const isOtherQuestion = (question: Question) => question.id !== questionId;

  questions.data.set(pipe(questions.data() ?? [], filter(isOtherQuestion)));
}, "removeFromQuestions");

export const restoreToQuestions = action((question: Question, atIndex: number) => {
  questions.data.set(sortedQuestions((questions.data() ?? []).toSpliced(atIndex, 0, question)));
}, "restoreToQuestions");
