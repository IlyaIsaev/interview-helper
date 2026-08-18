import { urlAtom, withCallHook } from '@reatom/core'

import { createQuestionForm } from '@/features/questions/create-question'
import { questionPath } from '@/shared/config'

createQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: createdQuestion }) => {
    urlAtom.go(questionPath(createdQuestion.id))
  }),
)
