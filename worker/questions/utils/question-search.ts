import { filter, pipe, sortBy } from "es-toolkit/fp";

import { markdownPlainText } from "@/shared/lib/markdown-plain-text";

type SearchableQuestion = {
  question: string;
};

const questionSortKey = (question: SearchableQuestion) =>
  markdownPlainText(question.question).toLowerCase();

export const questionsMatchingSearch = <TQuestion extends SearchableQuestion>(
  questions: ReadonlyArray<TQuestion>,
  query: string,
): ReadonlyArray<TQuestion> => {
  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (question: TQuestion) =>
    normalizedQuery.length === 0 ||
    markdownPlainText(question.question).toLowerCase().includes(normalizedQuery);

  return pipe(questions, filter(matchesQuery), sortBy<TQuestion>([questionSortKey]));
};
