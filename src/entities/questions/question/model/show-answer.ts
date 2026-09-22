import { action, atom, effect, peek, reatomBoolean } from "@reatom/core";

import { openedQuestionId } from "./question";
import { question } from "./opened-question";

export const isAnswerVisible = reatomBoolean(false, "isAnswerVisible");

export const showAnswer = isAnswerVisible.setTrue;

const listedQuestionId = atom<string | null>(null, "listedQuestionId");

const isOpenedQuestionSettled = (questionId: string, loadedQuestionId: string | undefined) =>
  loadedQuestionId === questionId || (loadedQuestionId === undefined && questionId.length === 0);

effect(() => {
  const nextQuestion = question();
  const currentQuestionId = openedQuestionId();
  const pendingQuestionId = peek(listedQuestionId);
  const isSettled = isOpenedQuestionSettled(currentQuestionId, nextQuestion?.id);

  if (!isSettled) {
    if (pendingQuestionId !== null) isAnswerVisible.setFalse();

    return;
  }

  listedQuestionId.set(null);

  if (pendingQuestionId !== null && nextQuestion?.id === pendingQuestionId) {
    isAnswerVisible.setTrue();

    return;
  }

  isAnswerVisible.setFalse();
}, "openedQuestionAnswer");

export const openListedQuestion = action((questionId: string) => {
  if (openedQuestionId() === questionId) {
    showAnswer();

    return;
  }

  listedQuestionId.set(questionId);
}, "openListedQuestion");
