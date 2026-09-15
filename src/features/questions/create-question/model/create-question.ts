import { action, reatomBoolean, reatomForm, withCallHook, wrap } from '@reatom/core';

import {
  addToQuestions,
  openQuestion,
  questionFieldsSchema,
  questionsQuery,
  refetchQuestions,
} from '@/entities/questions/question';
import { clientApi } from '@/shared/api';
import { markdownPlainText, toast } from '@/shared/ui';

export const isCreateQuestionDialogOpen = reatomBoolean(
  false,
  'isCreateQuestionDialogOpen',
);

export const openCreateQuestion = isCreateQuestionDialogOpen.setTrue;

export const closeCreateQuestionDialog = action(() => {
  isCreateQuestionDialogOpen.setFalse();

  createQuestionForm.reset();
}, 'closeCreateQuestionDialog');

export const createQuestionForm = reatomForm(
  {
    question: '',
    answer: '',
  },
  {
    name: 'createQuestionForm',
    validateOnBlur: true,
    validateOnChange: true,
    schema: questionFieldsSchema,
    onSubmit: async ({ question, answer }) => {
      try {
        return await wrap(clientApi.createQuestion({ question, answer }));
      } catch {
        toast.error('Could not create the question. Try again later.', {
          description: markdownPlainText(question),
        });
      }
    },
  },
);

const syncCreatedQuestion = action(async (createdQuestion: {
  id: string;
  question: string;
}) => {
  if (questionsQuery().length === 0) {
    addToQuestions({
      id: createdQuestion.id,
      question: createdQuestion.question,
    });
  }

  await wrap(refetchQuestions());
}, 'syncCreatedQuestion');

createQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: createdQuestion }) => {
    if (!createdQuestion) return;

    closeCreateQuestionDialog();

    openQuestion(createdQuestion.id);

    syncCreatedQuestion(createdQuestion);

    toast.success('Question created.', {
      description: markdownPlainText(createdQuestion.question),
    });
  }),
);
