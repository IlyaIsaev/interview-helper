import { action, withAbort, withAsync, wrap } from '@reatom/core';

import { initQuestion, openedQuestionId } from '@/entities/questions/question';
import { clientApi } from '@/shared/api';

export const loadOpenedQuestion = action(async (questionId: string) => {
  if (questionId.length === 0) {
    initQuestion(null);

    return;
  }

  const nextQuestion = await wrap(clientApi.loadQuestion(questionId));

  if (openedQuestionId() !== questionId) return;

  if (!nextQuestion) {
    initQuestion(null);

    return;
  }

  initQuestion(nextQuestion);
}, 'loadOpenedQuestion').extend(withAsync(), withAbort());
