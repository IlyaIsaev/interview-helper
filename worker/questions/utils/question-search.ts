import { clone } from 'es-toolkit';
import { filter, pipe } from 'es-toolkit/fp';

import { markdownPlainText } from '@/shared/lib/markdown-plain-text';

type SearchableQuestion = {
  question: string;
};

export const questionsMatchingSearch = <TQuestion extends SearchableQuestion>(
  questions: ReadonlyArray<TQuestion>,
  query: string,
): ReadonlyArray<TQuestion> => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) return clone(questions);

  const matchesQuery = (question: TQuestion) =>
    markdownPlainText(question.question).toLowerCase().includes(normalizedQuery);

  return pipe(questions, filter(matchesQuery));
};
