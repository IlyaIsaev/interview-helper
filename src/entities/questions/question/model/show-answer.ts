import { action, atom, reatomBoolean, urlAtom, withCallHook } from "@reatom/core";

import { questionPath } from "@/shared/config";

import { initQuestion, openQuestion, type OpenedQuestion } from "./question";

export const isAnswerVisible = reatomBoolean(false, "isAnswerVisible");

export const showAnswer = isAnswerVisible.setTrue;

const listedQuestionId = atom<string | null>(null, "listedQuestionId");

initQuestion.extend(
  withCallHook((_payload, [nextQuestion]: [OpenedQuestion | null]) => {
    const questionId = listedQuestionId();

    listedQuestionId.set(null);

    if (questionId !== null && nextQuestion?.id === questionId) {
      isAnswerVisible.setTrue();

      return;
    }

    isAnswerVisible.setFalse();
  }),
);

export const openListedQuestion = action((questionId: string) => {
  if (urlAtom().pathname === questionPath(questionId)) {
    showAnswer();

    return;
  }

  listedQuestionId.set(questionId);

  openQuestion(questionId);
}, "openListedQuestion");
