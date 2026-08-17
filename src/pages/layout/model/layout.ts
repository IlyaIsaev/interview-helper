import { reatomBoolean, urlAtom, withCallHook } from '@reatom/core'

import { createQuestionForm } from '@/features/questions/create-question'
import { questionPath } from '@/shared/config'

export const isSidebarOpen = reatomBoolean(true, 'isSidebarOpen')

createQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: createdQuestion }) => {
    urlAtom.go(questionPath(createdQuestion.id))
  }),
)
