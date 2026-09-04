import { action, reatomBoolean, reatomForm, urlAtom, withCallHook, wrap } from '@reatom/core'

import { addQuestion, initQuestionList, questionListQuery } from '@/entities/question'
import { clientApi } from '@/shared/api'
import { questionPath } from '@/shared/config'

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
    onSubmit: ({ question, answer }) =>
      wrap(clientApi.createQuestion({ question, answer })),
  },
)

const syncCreatedQuestion = action(async (createdQuestion: {
  id: string
  question: string
}) => {
  if (questionListQuery().length === 0) {
    addQuestion({
      id: createdQuestion.id,
      question: createdQuestion.question,
    })

    return
  }

  try {
    const { questions } = await wrap(clientApi.loadQuestions(questionListQuery()))

    initQuestionList(questions)
  } catch {
    return
  }
}, 'syncCreatedQuestion')

createQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: createdQuestion }) => {
    closeCreateQuestionDialog()
    urlAtom.go(questionPath(createdQuestion.id))
    syncCreatedQuestion(createdQuestion)
  }),
)
