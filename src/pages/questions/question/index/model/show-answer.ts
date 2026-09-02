import { reatomBoolean, withCallHook } from '@reatom/core'

import { initQuestion } from '@/entities/question'

export const isAnswerVisible = reatomBoolean(false, 'isAnswerVisible')

export const showAnswer = isAnswerVisible.setTrue

initQuestion.extend(
  withCallHook(() => {
    isAnswerVisible.setFalse()
  }),
)
