import { action, isAbort, reatomBoolean, reatomForm, wrap } from "@reatom/core";

import { openQuestion } from "@/app/routes";
import {
  activeQuestionsQuery,
  addToQuestions,
  parseQuestionMarkdown,
  questionFieldsSchema,
  questions,
} from "@/entities/questions/question";
import { clientApi } from "@/shared/api";
import { isSignedIn } from "@/shared/auth";
import { markdownPlainText, toast } from "@/shared/ui";

export const isCreateQuestionDialogOpen = reatomBoolean(false, "isCreateQuestionDialogOpen");

export const openCreateQuestion = isCreateQuestionDialogOpen.setTrue;

export const closeCreateQuestionDialog = action(() => {
  isCreateQuestionDialogOpen.setFalse();

  createQuestionForm.reset();
}, "closeCreateQuestionDialog");

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

  createQuestionForm.fields.question.change(parsed.question);

  createQuestionForm.fields.answer.change(parsed.answer);
}, "importQuestionFromMarkdown");

export const createQuestionForm = reatomForm(
  {
    question: "",
    answer: "",
  },
  {
    name: "createQuestionForm",
    validateOnBlur: true,
    validateOnChange: false,
    schema: questionFieldsSchema,
    onSubmit: async ({ question, answer }) => {
      if (!isSignedIn()) return;

      const previousQuestions = questions.data();
      const isSearchEmpty = activeQuestionsQuery().length === 0;

      try {
        const createdQuestion = await wrap(clientApi.createQuestion({ question, answer }));

        if (isSearchEmpty) {
          addToQuestions({
            id: createdQuestion.id,
            question: createdQuestion.question,
          });
        }

        closeCreateQuestionDialog();

        openQuestion(createdQuestion.id);

        toast.success("Question created.", {
          description: markdownPlainText(createdQuestion.question),
        });

        try {
          await wrap(questions.retry());
        } catch (error) {
          if (isAbort(error)) return createdQuestion;
        }

        return createdQuestion;
      } catch (error) {
        if (isAbort(error)) return;

        questions.data.set(previousQuestions);

        toast.error("Could not create the question. Try again later.", {
          description: markdownPlainText(question),
        });

        throw error instanceof Error
          ? error
          : new Error("Could not create the question. Try again later.");
      }
    },
  },
);
