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

  if (normalizedQuery.length === 0) return [...questions];

  const matchesQuery = (row: TQuestion) =>
    markdownPlainText(row.question).toLowerCase().includes(normalizedQuery);

  return pipe(questions, filter(matchesQuery));
};
