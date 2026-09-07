import { action, atom, reatomString, withAbort, wrap } from '@reatom/core';
import { filter, flatten, map, pick, pipe } from 'es-toolkit/fp';
import type { DeepReadonly } from 'es-toolkit/types';

import { clientApi } from '@/shared/api';

export type Question = DeepReadonly<{
  id: string;
  question: string;
}>;

export const questions = atom<Array<Question> | null>(null, 'questions');

export const questionsQuery = reatomString('', 'questionsQuery');

export const initQuestions = action((nextQuestions: Array<Question>) => {
  questions.set(pipe(nextQuestions, map(pick(['id', 'question']))));
}, 'initQuestions');

export const resetQuestions = action(() => {
  questions.set(null);

  questionsQuery.set('');
}, 'resetQuestions');

export const addToQuestions = action((question: Question) => {
  questions.set(pipe([questions() ?? [], [question]], flatten()));
}, 'addToQuestions');

export const updateInQuestions = action((nextQuestion: Question) => {
  const replaceQuestion = (question: Question) =>
    question.id === nextQuestion.id ? nextQuestion : question;

  questions.set(pipe(questions() ?? [], map(replaceQuestion)));
}, 'updateInQuestions');

export const removeFromQuestions = action((questionId: string) => {
  const isOtherQuestion = (question: Question) => question.id !== questionId;

  questions.set(pipe(questions() ?? [], filter(isOtherQuestion)));
}, 'removeFromQuestions');

export const restoreToQuestions = action(
  (question: Question, atIndex: number) => {
    questions.set(
      (questions() ?? []).toSpliced(
        atIndex,
        0,
        pipe(question, pick(['id', 'question'])),
      ),
    );
  },
  'restoreToQuestions',
);

export const refetchQuestions = action(async () => {
  try {
    const { questions: nextQuestions } = await wrap(
      clientApi.loadQuestions(questionsQuery()),
    );

    initQuestions(nextQuestions);
  } catch {
    return;
  }
}, 'refetchQuestions').extend(withAbort());
