import { action, reatomString, sleep, withAbort, wrap } from '@reatom/core'

import { initQuestionList, questionListQuery } from '@/entities/question'
import { clientApi } from '@/shared/api'

export const questionSearch = reatomString('', 'questionSearch')

export const searchQuestions = action(async () => {
  await wrap(sleep(300))

  try {
    const { questions } = await wrap(clientApi.loadQuestions(questionListQuery()))

    initQuestionList(questions)
  } catch {
    return
  }
}, 'searchQuestions').extend(withAbort())
