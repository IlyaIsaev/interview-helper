import { filter, pipe } from 'es-toolkit/fp'

import { markdownPlainText } from '@/shared/lib/markdown-plain-text'

type SearchableQuestion = {
  question: string
}

export const questionsMatchingSearch = <Question extends SearchableQuestion>(
  questions: Array<Question>,
  query: string,
): Array<Question> => {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) {
    return questions
  }

  const matchesQuery = (row: Question) =>
    markdownPlainText(row.question).toLowerCase().includes(normalizedQuery)

  return pipe(questions, filter(matchesQuery))
}
