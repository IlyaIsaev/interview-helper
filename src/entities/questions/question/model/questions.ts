import { action, computed, reatomString, sleep, urlAtom, withAsyncData, wrap } from "@reatom/core";
import { filter, flatten, map, pipe } from "es-toolkit/fp";
import type { DeepReadonly } from "es-toolkit/types";

import { clientApi } from "@/shared/api";
import { session } from "@/shared/auth";
import { THEORY_PATH } from "@/shared/config";

export type Question = DeepReadonly<{
  id: string;
  question: string;
}>;

export const questionSearch = reatomString("", "questionSearch");

export const theoryQuestionSearch = reatomString("", "theoryQuestionSearch");

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
  const query = activeQuestionsQuery();

  await waitUntilSessionSettles();

  if (query.length > 0) await wrap(sleep(300));

  if ((session.data()?.user?.id ?? null) !== signedInUserId) return null;

  const { questions: nextQuestions } = await wrap(clientApi.loadQuestions(query));

  return nextQuestions;
}, "questions").extend(withAsyncData({ initState: null as ReadonlyArray<Question> | null }));

export const resetQuestions = action(() => {
  questionSearch.reset();

  theoryQuestionSearch.reset();

  questions.data.set(null);
}, "resetQuestions");

export const addToQuestions = action((question: Question) => {
  questions.data.set(pipe([questions.data() ?? [], [question]], flatten()));
}, "addToQuestions");

export const updateInQuestions = action((nextQuestion: Question) => {
  const replaceQuestion = (question: Question) =>
    question.id === nextQuestion.id ? nextQuestion : question;

  questions.data.set(pipe(questions.data() ?? [], map(replaceQuestion)));
}, "updateInQuestions");

export const removeFromQuestions = action((questionId: string) => {
  const isOtherQuestion = (question: Question) => question.id !== questionId;

  questions.data.set(pipe(questions.data() ?? [], filter(isOtherQuestion)));
}, "removeFromQuestions");

export const restoreToQuestions = action((question: Question, atIndex: number) => {
  questions.data.set((questions.data() ?? []).toSpliced(atIndex, 0, question));
}, "restoreToQuestions");
