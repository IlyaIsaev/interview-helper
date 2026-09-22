import { notify, urlAtom } from "@reatom/core";
import { expect, test } from "vitest";

import { questionRoute } from "@/app/routes";
import { QUESTIONS_PATH, questionPath } from "@/shared/config";

import type { OpenedQuestion } from "../question";
import { isAnswerVisible, openListedQuestion } from "../show-answer";

const currentQuestionId = "11111111-1111-1111-1111-111111111111";
const otherQuestionId = "22222222-2222-2222-2222-222222222222";

const currentQuestion = {
  id: currentQuestionId,
  question: "Current",
  answer: "Current answer",
};

const otherQuestion = {
  id: otherQuestionId,
  question: "Other",
  answer: "Other answer",
};

const showLoadedQuestion = (nextQuestion: OpenedQuestion | null) => {
  if (!nextQuestion) {
    urlAtom.go(QUESTIONS_PATH);
    questionRoute.loader.data.set(null);
    notify();

    return;
  }

  urlAtom.go(questionPath(nextQuestion.id));
  questionRoute.loader.data.set(nextQuestion);
  notify();
};

test("should reveal the answer when a listed question loads", () => {
  showLoadedQuestion(null);
  showLoadedQuestion(currentQuestion);
  isAnswerVisible.setFalse();

  openListedQuestion(otherQuestionId);
  expect(isAnswerVisible()).toBe(false);

  showLoadedQuestion(otherQuestion);

  expect(isAnswerVisible()).toBe(true);
});

test("should reveal the answer when the listed question is already open", () => {
  showLoadedQuestion(null);
  showLoadedQuestion(currentQuestion);
  isAnswerVisible.setFalse();

  openListedQuestion(currentQuestionId);

  expect(isAnswerVisible()).toBe(true);
});

test("should hide the answer when a different question loads after a listed open", () => {
  showLoadedQuestion(null);
  showLoadedQuestion(currentQuestion);
  isAnswerVisible.setFalse();

  openListedQuestion(otherQuestionId);
  showLoadedQuestion(currentQuestion);

  expect(isAnswerVisible()).toBe(false);
});

test("should hide the answer when a question loads without a listed open", () => {
  showLoadedQuestion(null);
  showLoadedQuestion(currentQuestion);
  isAnswerVisible.setTrue();

  showLoadedQuestion(otherQuestion);

  expect(isAnswerVisible()).toBe(false);
});
