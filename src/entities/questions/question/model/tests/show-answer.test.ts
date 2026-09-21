import { notify, urlAtom } from "@reatom/core";
import { expect, test } from "vitest";

import { questionPath } from "@/shared/config";

import { initQuestion, type OpenedQuestion } from "../question";
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

const loadQuestion = (nextQuestion: OpenedQuestion | null) => {
  initQuestion(nextQuestion);
  notify();
};

test("should reveal the answer when a listed question loads", () => {
  loadQuestion(null);
  urlAtom.go(questionPath(currentQuestionId));
  loadQuestion(currentQuestion);
  isAnswerVisible.setFalse();

  openListedQuestion(otherQuestionId);
  expect(isAnswerVisible()).toBe(false);

  loadQuestion(otherQuestion);

  expect(isAnswerVisible()).toBe(true);
});

test("should reveal the answer when the listed question is already open", () => {
  loadQuestion(null);
  urlAtom.go(questionPath(currentQuestionId));
  loadQuestion(currentQuestion);
  isAnswerVisible.setFalse();

  openListedQuestion(currentQuestionId);

  expect(isAnswerVisible()).toBe(true);
});

test("should hide the answer when a different question loads after a listed open", () => {
  loadQuestion(null);
  urlAtom.go(questionPath(currentQuestionId));
  loadQuestion(currentQuestion);
  isAnswerVisible.setFalse();

  openListedQuestion(otherQuestionId);
  loadQuestion(currentQuestion);

  expect(isAnswerVisible()).toBe(false);
});

test("should hide the answer when a question loads without a listed open", () => {
  loadQuestion(null);
  urlAtom.go(questionPath(currentQuestionId));
  isAnswerVisible.setTrue();

  loadQuestion(otherQuestion);

  expect(isAnswerVisible()).toBe(false);
});
