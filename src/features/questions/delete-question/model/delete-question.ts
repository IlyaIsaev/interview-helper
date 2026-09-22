import { action, atom, isAbort, reatomBoolean, urlAtom, withAsync, wrap } from "@reatom/core";
import { findIndex, pipe } from "es-toolkit/fp";

import { questionsRoute, theoryOpenedRoute } from "@/app/routes";
import {
  activeQuestionsQuery,
  openedQuestionId,
  questions,
  removeFromQuestions,
  type Question,
} from "@/entities/questions/question";
import { clientApi } from "@/shared/api";
import { isSignedIn } from "@/shared/auth";
import { THEORY_PATH } from "@/shared/config";
import { markdownPlainText, toast } from "@/shared/ui";

export const deletedQuestionId = atom<string | null>(null, "deletedQuestionId");

export const isDeleteQuestionDialogOpen = reatomBoolean(false, "isDeleteQuestionDialogOpen");

const hasQuestionId =
  (questionId: string) =>
  (question: Question): boolean =>
    question.id === questionId;

export const closeDeleteQuestionDialog = action(() => {
  isDeleteQuestionDialogOpen.setFalse();

  deletedQuestionId.set(null);
}, "closeDeleteQuestionDialog");

export const openDeleteQuestion = action((questionId: string) => {
  deletedQuestionId.set(questionId);

  isDeleteQuestionDialogOpen.setTrue();
}, "openDeleteQuestion");

export const deleteQuestion = action(async () => {
  if (!isSignedIn()) return;

  const questionId = deletedQuestionId();

  if (!questionId) return;

  const questionIndex = pipe(questions.data() ?? [], findIndex(hasQuestionId(questionId)));
  const question = (questions.data() ?? [])[questionIndex];
  const questionDescription =
    question === undefined ? undefined : markdownPlainText(question.question);
  const isSearchEmpty = activeQuestionsQuery().length === 0;
  const previousQuestions = questions.data();

  closeDeleteQuestionDialog();

  if (isSearchEmpty) removeFromQuestions(questionId);

  try {
    await wrap(clientApi.deleteQuestion(questionId));
  } catch (error) {
    if (isAbort(error)) return;

    questions.data.set(previousQuestions);

    toast.error("Could not delete the question. Try again later.", {
      description: questionDescription,
    });

    throw error instanceof Error
      ? error
      : new Error("Could not delete the question. Try again later.");
  }

  toast.success("Question deleted.", {
    description: questionDescription,
  });

  if (urlAtom().pathname === THEORY_PATH) {
    if (openedQuestionId() === questionId) theoryOpenedRoute.go({});
  } else if (openedQuestionId() === questionId) {
    questionsRoute.go(undefined, true);
  }

  try {
    await wrap(questions.retry());
  } catch (error) {
    if (isAbort(error)) return;
  }
}, "deleteQuestion").extend(withAsync());
