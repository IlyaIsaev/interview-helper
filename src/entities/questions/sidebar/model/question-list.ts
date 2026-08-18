import { computed, withAsyncData, wrap } from '@reatom/core'

import { clientApi } from '@/shared/api'

export type QuestionListItem = {
  id: string
  question: string
}

export const questionList = computed(async (): Promise<Array<QuestionListItem>> => {
  const { questions } = await wrap(clientApi.loadQuestions())

  return questions.map(({ id, question }) => ({
    id,
    question,
  }))
}, 'questionList').extend(withAsyncData({ initState: [] }))
