import { computed, reatomString } from '@reatom/core'
import { filter, pipe } from 'es-toolkit/fp'

import { questionList, type QuestionListItem } from '@/entities/question'
import { markdownPlainText } from '@/shared/ui'

export const questionSearch = reatomString('', 'questionSearch')

const matchesQuestionSearch = (query: string) => (question: QuestionListItem) =>
  markdownPlainText(question.question).toLowerCase().includes(query)

export const filteredQuestions = computed(() => {
  const questions = questionList()

  if (questions === null) {
    return null
  }

  const query = questionSearch().trim().toLowerCase()

  if (query.length === 0) {
    return questions
  }

  return pipe(questions, filter(matchesQuestionSearch(query)))
}, 'filteredQuestions')
