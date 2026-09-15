import { action, computed, urlAtom } from '@reatom/core';
import { filter, pipe, sample } from 'es-toolkit/fp';

import { QUESTIONS_PATH, questionPath } from '@/shared/config';

import { questions, type Question } from './questions';

const currentQuestionId = computed(() => {
  const { pathname } = urlAtom();
  const prefix = `${QUESTIONS_PATH}/`;

  if (!pathname.startsWith(prefix)) return null;

  const questionId = pathname.slice(prefix.length);

  if (questionId.length === 0 || questionId.includes('/')) return null;

  return questionId;
}, 'currentQuestionId');

const isOtherQuestion = (openedQuestionId: string) => (question: Question) =>
  question.id !== openedQuestionId;

export const otherQuestions = computed(() => {
  const openedQuestionId = currentQuestionId();

  if (!openedQuestionId) return [];

  return pipe(questions() ?? [], filter(isOtherQuestion(openedQuestionId)));
}, 'otherQuestions');

export const openNextQuestion = action(() => {
  const nextQuestion = pipe(otherQuestions(), sample());

  if (!nextQuestion) return;

  urlAtom.go(questionPath(nextQuestion.id));
}, 'openNextQuestion');
