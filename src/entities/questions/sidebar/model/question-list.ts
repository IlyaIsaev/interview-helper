import { computed, withAsyncData, wrap } from '@reatom/core'

import { api } from '@/shared/api'

type QuestionListResponse = {
  questions: Array<{
    id: string
    question: string
    answer: string
  }>
}

export type QuestionListItem = {
  id: string
  question: string
}

export const questionList = computed(async (): Promise<Array<QuestionListItem>> => {
  const response = await wrap(api.api.questions.$get())

  if (!response.ok) {
    throw new Error(`GET /api/questions failed: ${response.status}`)
  }

  const body: QuestionListResponse = await wrap(response.json())

  return body.questions.map(({ id, question }) => ({
    id,
    question,
  }))
}, 'questionList').extend(withAsyncData({ initState: [] }))
