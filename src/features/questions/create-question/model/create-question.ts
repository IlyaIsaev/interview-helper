import { action, reatomBoolean, reatomForm, withCallHook, wrap } from '@reatom/core'

import { addQuestion } from '@/entities/questions/sidebar'
import { clientApi } from '@/shared/api'

import { questionFieldsSchema } from './question-fields'

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
    schema: questionFieldsSchema,
    onSubmit: async ({ question, answer }) => {
      return await wrap(clientApi.createQuestion({ question, answer }))
    },
  },
)

createQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: createdQuestion }) => {
    addQuestion({
      id: createdQuestion.id,
      question: createdQuestion.question,
    })
    closeCreateQuestionDialog()
  }),
)
