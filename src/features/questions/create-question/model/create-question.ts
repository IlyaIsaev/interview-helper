import { action, reatomBoolean, reatomForm, withCallHook, wrap } from '@reatom/core';

import {
  addToQuestions,
  openQuestion,
  parseQuestionMarkdown,
  questionFieldsSchema,
  questionsQuery,
  refetchQuestions,
} from '@/entities/questions/question';
import { clientApi } from '@/shared/api';
import { markdownPlainText, registerFormSchemaValidation, toast } from '@/shared/ui';

export const isCreateQuestionDialogOpen = reatomBoolean(
  false,
  'isCreateQuestionDialogOpen',
);

export const openCreateQuestion = isCreateQuestionDialogOpen.setTrue;

export const closeCreateQuestionDialog = action(() => {
  isCreateQuestionDialogOpen.setFalse();

  createQuestionForm.reset();
}, 'closeCreateQuestionDialog');

const markdownImportInvalidMessage = 'The file must start with a heading.';

export const importQuestionFromMarkdown = action(async (file: File) => {
  if (!file.name.toLowerCase().endsWith('.md')) {
    toast.error(markdownImportInvalidMessage);

    return;
  }

  const content = await wrap(file.text());
  const parsed = parseQuestionMarkdown(content);

  if (!parsed) {
    toast.error(markdownImportInvalidMessage);

    return;
  }

  createQuestionForm.fields.question.change(parsed.question);

  createQuestionForm.fields.answer.change(parsed.answer);
}, 'importQuestionFromMarkdown');

export const createQuestionForm = reatomForm(
  {
    question: '',
    answer: '',
  },
  {
    name: 'createQuestionForm',
    validateOnBlur: false,
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

registerFormSchemaValidation(createQuestionForm, [
  createQuestionForm.fields.question,
  createQuestionForm.fields.answer,
]);

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
