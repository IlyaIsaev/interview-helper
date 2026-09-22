import {
  action,
  atom,
  isAbort,
  reatomBoolean,
  reatomForm,
  withAbort,
  withAsync,
  wrap,
} from "@reatom/core";
import { find, pipe } from "es-toolkit/fp";

import { openQuestion, questionRoute, theoryOpenedRoute } from "@/app/routes";
import {
  activeQuestionsQuery,
  openedQuestionId,
  parseQuestionMarkdown,
  question as openedQuestion,
  questionFieldsSchema,
  questions,
  updateInQuestions,
  type OpenedQuestion,
  type Question,
} from "@/entities/questions/question";
import { clientApi } from "@/shared/api";
import { isSignedIn } from "@/shared/auth";
import { markdownPlainText, toast } from "@/shared/ui";

export const updatedQuestionId = atom<string | null>(null, "updatedQuestionId");

export const isUpdateQuestionDialogOpen = reatomBoolean(false, "isUpdateQuestionDialogOpen");

const hasQuestionId =
  (questionId: string) =>
  (question: Question): boolean =>
    question.id === questionId;

export const closeUpdateQuestionDialog = action(() => {
  openUpdateQuestion.abort();

  isUpdateQuestionDialogOpen.setFalse();

  updatedQuestionId.set(null);

  updateQuestionForm.reset();
}, "closeUpdateQuestionDialog");

const patchOpenedQuestion = (questionId: string, nextOpenedQuestion: OpenedQuestion | null) => {
  if (questionRoute()?.id === questionId) questionRoute.loader.data.set(nextOpenedQuestion);

  if (theoryOpenedRoute()?.id === questionId) {
    theoryOpenedRoute.loader.data.set(nextOpenedQuestion);
  }
};

export const updateQuestionForm = reatomForm(
  {
    question: "",
    answer: "",
  },
  {
    name: "updateQuestionForm",
    validateOnBlur: true,
    validateOnChange: false,
    schema: questionFieldsSchema,
    onSubmit: async ({ question: nextQuestion, answer: nextAnswer }) => {
      if (!isSignedIn()) return;

      const questionId = updatedQuestionId();

      if (!questionId) return;

      const question = pipe(questions.data() ?? [], find(hasQuestionId(questionId)));
      const isQuestionOpened = openedQuestionId() === questionId;
      const questionOnPage = isQuestionOpened ? openedQuestion() : undefined;
      const questionText = question?.question ?? questionOnPage?.question;
      const questionDescription =
        questionText === undefined ? undefined : markdownPlainText(questionText);
      const isSearchEmpty = activeQuestionsQuery().length === 0;
      const previousQuestions = questions.data();

      const syncQuestion = (
        nextListedQuestion: Question | undefined,
        nextOpenedQuestion: OpenedQuestion | null,
      ) => {
        if (isSearchEmpty && nextListedQuestion !== undefined)
          updateInQuestions(nextListedQuestion);

        if (isQuestionOpened) patchOpenedQuestion(questionId, nextOpenedQuestion);
      };

      closeUpdateQuestionDialog();

      syncQuestion(
        { id: questionId, question: nextQuestion },
        { id: questionId, question: nextQuestion, answer: nextAnswer },
      );

      try {
        const updatedQuestion = await wrap(
          clientApi.updateQuestion(questionId, {
            question: nextQuestion,
            answer: nextAnswer,
          }),
        );

        syncQuestion(
          {
            id: updatedQuestion.id,
            question: updatedQuestion.question,
          },
          {
            id: updatedQuestion.id,
            question: updatedQuestion.question,
            answer: updatedQuestion.answer,
          },
        );

        openQuestion(updatedQuestion.id);

        toast.success("Question updated.", {
          description: questionDescription,
        });

        try {
          await wrap(questions.retry());
        } catch (error) {
          if (isAbort(error)) return updatedQuestion;
        }

        return updatedQuestion;
      } catch (error) {
        if (isAbort(error)) return;

        questions.data.set(previousQuestions);

        if (isQuestionOpened) patchOpenedQuestion(questionId, questionOnPage ?? null);

        toast.error("Could not update the question. Try again later.", {
          description: questionDescription,
        });

        throw error instanceof Error
          ? error
          : new Error("Could not update the question. Try again later.");
      }
    },
  },
);

const markdownImportInvalidMessage = "The file must start with a heading.";

export const importQuestionFromMarkdown = action(async (file: File) => {
  if (!file.name.toLowerCase().endsWith(".md")) {
    toast.error(markdownImportInvalidMessage);

    return;
  }

  const content = await wrap(file.text());
  const parsed = parseQuestionMarkdown(content);

  if (!parsed) {
    toast.error(markdownImportInvalidMessage);

    return;
  }

  updateQuestionForm.fields.question.change(parsed.question);

  updateQuestionForm.fields.answer.change(parsed.answer);
}, "importQuestionFromMarkdown");

export const openUpdateQuestion = action(async (questionId: string) => {
  updatedQuestionId.set(questionId);

  isUpdateQuestionDialogOpen.setTrue();

  const nextQuestion = await wrap(clientApi.loadQuestion(questionId));

  if (!nextQuestion) {
    closeUpdateQuestionDialog();

    return;
  }

  updateQuestionForm.reset({
    question: nextQuestion.question,
    answer: nextQuestion.answer,
  });
}, "openUpdateQuestion").extend(withAsync(), withAbort());
