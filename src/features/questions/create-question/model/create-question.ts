import {
  abortVar,
  action,
  reatomBoolean,
  reatomForm,
  withCallHook,
  wrap,
} from '@reatom/core'
import * as v from 'valibot'

import { api } from '@/shared/api'

export type CreatedQuestion = {
  id: string
  question: string
  answer: string
}

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

const createQuestion = async (
  questionText: string,
  answerText: string,
): Promise<CreatedQuestion> => {
  const { controller, unsubscribe } = abortVar.subscribe()

  try {
    const response = await wrap(
      api.api.questions.$post(
        {
          json: {
            question: questionText,
            answer: answerText,
          },
        },
        {
          init: {
            signal: controller.signal,
          },
        },
      ),
    )

    if (!response.ok) {
      throw new Error(`POST /api/questions failed: ${response.status}`)
    }

    return await wrap(response.json())
  } finally {
    unsubscribe()
  }
}

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
      return await wrap(createQuestion(question, answer))
    },
  },
)

createQuestionForm.submit.onFulfill.extend(
  withCallHook(() => {
    closeCreateQuestionDialog()
  }),
)
