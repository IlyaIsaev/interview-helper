import { action, reatomBoolean, reatomForm, withCallHook, wrap } from '@reatom/core'
import * as v from 'valibot'

import { clientApi } from '@/shared/api'

const createQuestionSchema = v.object({
  question: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter a question')),
  answer: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter an answer')),
})

export const isCreateQuestionDialogOpen = reatomBoolean(
  false,
  'isCreateQuestionDialogOpen',
)

export const openCreateQuestion = isCreateQuestionDialogOpen.setTrue

export const closeCreateQuestionDialog = action(() => {
  isCreateQuestionDialogOpen.setFalse()
  createQuestionForm.reset()
}, 'closeCreateQuestionDialog')

export const createQuestionForm = reatomForm(
  {
    question: '',
    answer: '',
  },
  {
    name: 'createQuestionForm',
    validateOnBlur: true,
    validateOnChange: true,
    schema: createQuestionSchema,
    onSubmit: async ({ question, answer }) => {
      return await wrap(clientApi.createQuestion({ question, answer }))
    },
  },
)

createQuestionForm.submit.onFulfill.extend(
  withCallHook(() => {
    closeCreateQuestionDialog()
  }),
)
