import { computed } from "@reatom/core";
import { filter, pipe } from "es-toolkit/fp";

import { openedQuestionId } from "./question";
import { questions, type Question } from "./questions";

const isOtherQuestion = (currentQuestionId: string) => (question: Question) =>
  question.id !== currentQuestionId;

export const otherQuestions = computed(() => {
  const currentQuestionId = openedQuestionId();

  if (currentQuestionId.length === 0) return [];

  return pipe(questions.data() ?? [], filter(isOtherQuestion(currentQuestionId)));
}, "otherQuestions");
