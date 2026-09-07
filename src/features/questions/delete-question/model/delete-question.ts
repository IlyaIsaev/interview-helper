import { action, atom, reatomBoolean, urlAtom, withAsync, wrap } from '@reatom/core';
import { findIndex, pipe } from 'es-toolkit/fp';

import {
  initQuestion,
  questions,
  questionsQuery,
  refetchQuestions,
  removeFromQuestions,
  restoreToQuestions,
  type Question,
} from '@/entities/question';
import { clientApi } from '@/shared/api';
import { questionPath, QUESTIONS_PATH } from '@/shared/config';
import { markdownPlainText, toast } from '@/shared/ui';

export const deletedQuestionId = atom<string | null>(null, 'deletedQuestionId');

export const isDeleteQuestionDialogOpen = reatomBoolean(
  false,
  'isDeleteQuestionDialogOpen',
);

const hasQuestionId =
  (questionId: string) =>
  (question: Question): boolean =>
    question.id === questionId;

export const closeDeleteQuestionDialog = action(() => {
  isDeleteQuestionDialogOpen.setFalse();

  deletedQuestionId.set(null);
}, 'closeDeleteQuestionDialog');

export const openDeleteQuestion = action((questionId: string) => {
  deletedQuestionId.set(questionId);

  isDeleteQuestionDialogOpen.setTrue();
}, 'openDeleteQuestion');

export const deleteQuestion = action(async () => {
  const questionId = deletedQuestionId();
  if (!questionId) return;

  const index = pipe(questions() ?? [], findIndex(hasQuestionId(questionId)));
  const question = (questions() ?? [])[index];
  const questionDescription =
    question === undefined ? undefined : markdownPlainText(question.question);
  const isSearchEmpty = questionsQuery().length === 0;

  closeDeleteQuestionDialog();

  if (isSearchEmpty) {
    removeFromQuestions(questionId);
  }

  try {
    await wrap(clientApi.deleteQuestion(questionId));
  } catch {
    if (isSearchEmpty && question !== undefined) {
      restoreToQuestions(question, index);
    }

    toast.error('Could not delete the question. Try again later.', {
      description: questionDescription,
    });

    return;
  }

  toast.success('Question deleted.', {
    description: questionDescription,
  });

  if (urlAtom().pathname === questionPath(questionId)) {
    initQuestion(null);

    urlAtom.go(QUESTIONS_PATH);
  }

  await wrap(refetchQuestions());
}, 'deleteQuestion').extend(withAsync());
