import {
  action,
  atom,
  reatomBoolean,
  urlAtom,
  withAsync,
  withCallHook,
  wrap,
} from '@reatom/core'

import {
  initQuestion,
  initQuestionList,
  removeQuestion,
} from '@/entities/question'
import { clientApi } from '@/shared/api'
import { questionPath, QUESTIONS_PATH } from '@/shared/config'

export const questionBeingDeleted = atom<string | null>(
  null,
  'questionBeingDeleted',
)

export const isDeleteQuestionDialogOpen = reatomBoolean(
  false,
  'isDeleteQuestionDialogOpen',
)

export const closeDeleteQuestionDialog = action(() => {
  isDeleteQuestionDialogOpen.setFalse()
  questionBeingDeleted.set(null)
}, 'closeDeleteQuestionDialog')

export const openDeleteQuestion = action((questionId: string) => {
  questionBeingDeleted.set(questionId)
  isDeleteQuestionDialogOpen.setTrue()
}, 'openDeleteQuestion')

export const deleteQuestion = action(async () => {
  const questionId = questionBeingDeleted()

  if (!questionId) {
    return
  }

  await wrap(clientApi.deleteQuestion(questionId))

  removeQuestion(questionId)

  if (urlAtom().pathname === questionPath(questionId)) {
    initQuestion(null)
    urlAtom.go(QUESTIONS_PATH)
  }

  const { questions } = await wrap(clientApi.loadQuestions())

  initQuestionList(questions)
}, 'deleteQuestion').extend(withAsync())

deleteQuestion.onFulfill.extend(
  withCallHook(() => {
    closeDeleteQuestionDialog()
  }),
)
