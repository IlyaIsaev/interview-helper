import { action, atom } from '@reatom/core';
import { pick, pipe } from 'es-toolkit/fp';
import type { DeepReadonly } from 'es-toolkit/types';

export type OpenedQuestion = DeepReadonly<{
  question: string;
  answer: string;
}>;

export const question = atom<OpenedQuestion | null>(null, 'question');

export const initQuestion = action((nextQuestion: OpenedQuestion | null) => {
  if (!nextQuestion) {
    question.set(null);

    return;
  }

  question.set(pipe(nextQuestion, pick(['question', 'answer'])));
}, 'initQuestion');
