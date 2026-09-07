import {
  action,
  atom,
  reatomBoolean,
  withAbort,
  withAsync,
  withCallHook,
  wrap,
} from '@reatom/core';
import { pick, pipe } from 'es-toolkit/fp';

import { removeFromQuestions, type OpenedQuestion } from '@/entities/question';
import { clientApi } from '@/shared/api';

export const previewedQuestionId = atom<string | null>(
  null,
  'previewedQuestionId',
);

export const previewedQuestion = atom<OpenedQuestion | null>(
  null,
  'previewedQuestion',
);

export const isQuestionPreviewOpen = reatomBoolean(
  false,
  'isQuestionPreviewOpen',
);

export const closeQuestionPreview = action(() => {
  openQuestionPreview.abort();

  isQuestionPreviewOpen.setFalse();

  previewedQuestionId.set(null);

  previewedQuestion.set(null);
}, 'closeQuestionPreview');

export const openQuestionPreview = action(async (questionId: string) => {
  previewedQuestionId.set(questionId);

  isQuestionPreviewOpen.setTrue();

  previewedQuestion.set(null);

  const nextQuestion = await wrap(clientApi.loadQuestion(questionId));
  if (!nextQuestion) {
    closeQuestionPreview();

    return;
  }

  previewedQuestion.set(pipe(nextQuestion, pick(['question', 'answer'])));
}, 'openQuestionPreview').extend(withAsync(), withAbort());

removeFromQuestions.extend(
  withCallHook((_payload, [questionId]: [string]) => {
    if (previewedQuestionId() === questionId) {
      closeQuestionPreview();
    }
  }),
);
