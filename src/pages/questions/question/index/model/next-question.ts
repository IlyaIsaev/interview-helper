import { action, computed, urlAtom } from '@reatom/core';
import { filter, pipe, sample } from 'es-toolkit/fp';

import { questions, type Question } from '@/entities/question';
import { QUESTIONS_PATH, questionPath } from '@/shared/config';

const openedQuestionId = computed(() => {
  const { pathname } = urlAtom();
  const prefix = `${QUESTIONS_PATH}/`;
  if (!pathname.startsWith(prefix)) return null;

  const questionId = pathname.slice(prefix.length);
  if (questionId.length === 0 || questionId.includes('/')) return null;

  return questionId;
}, 'openedQuestionId');

const isOtherQuestion = (currentQuestionId: string) => (question: Question) =>
  question.id !== currentQuestionId;

export const otherQuestions = computed(() => {
  const currentQuestionId = openedQuestionId();
  if (!currentQuestionId) return [];

  return pipe(questions() ?? [], filter(isOtherQuestion(currentQuestionId)));
}, 'otherQuestions');

export const openNextQuestion = action(() => {
  const nextQuestion = pipe(otherQuestions(), sample());
  if (!nextQuestion) return;

  urlAtom.go(questionPath(nextQuestion.id));
}, 'openNextQuestion');
