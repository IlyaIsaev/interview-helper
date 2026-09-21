import { action, atom, reatomBoolean, urlAtom, withAsync, wrap } from "@reatom/core";
import { findIndex, pipe } from "es-toolkit/fp";

import {
  initQuestion,
  openedQuestionId,
  questions,
  questionsQuery,
  refetchQuestions,
  removeFromQuestions,
  restoreToQuestions,
  type Question,
} from "@/entities/questions/question";
import { clientApi } from "@/shared/api";
import { isSignedIn } from "@/shared/auth";
import { QUESTIONS_PATH, questionPath, THEORY_PATH } from "@/shared/config";
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

  const questionIndex = pipe(questions() ?? [], findIndex(hasQuestionId(questionId)));
  const question = (questions() ?? [])[questionIndex];
  const questionDescription =
    question === undefined ? undefined : markdownPlainText(question.question);
  const isSearchEmpty = questionsQuery().length === 0;

  closeDeleteQuestionDialog();

  if (isSearchEmpty) removeFromQuestions(questionId);

  try {
    await wrap(clientApi.deleteQuestion(questionId));
  } catch {
    if (isSearchEmpty && question !== undefined) restoreToQuestions(question, questionIndex);

    toast.error("Could not delete the question. Try again later.", {
      description: questionDescription,
    });

    return;
  }

  toast.success("Question deleted.", {
    description: questionDescription,
  });

  if (urlAtom().pathname === THEORY_PATH) {
    if (openedQuestionId() === questionId) {
      openedQuestionId.set("");

      initQuestion(null);
    }
  } else if (urlAtom().pathname === questionPath(questionId)) {
    initQuestion(null);

    urlAtom.go(QUESTIONS_PATH);
  }

  await wrap(refetchQuestions());
}, "deleteQuestion").extend(withAsync());
