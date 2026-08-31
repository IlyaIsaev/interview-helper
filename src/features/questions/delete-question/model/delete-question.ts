import { action, atom, reatomBoolean, urlAtom, withAsync, wrap } from '@reatom/core'

import {
  initQuestion,
  initQuestionList,
  questionList,
  removeQuestion,
  restoreQuestion,
} from '@/entities/question'
import { clientApi } from '@/shared/api'
import { questionPath, QUESTIONS_PATH } from '@/shared/config'
import { toast } from '@/shared/ui'

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

  const listedQuestions = questionList() ?? []
  const listedQuestionIndex = listedQuestions.findIndex(
    (listedQuestion) => listedQuestion.id === questionId,
  )
  const listedQuestion = listedQuestions[listedQuestionIndex]

  closeDeleteQuestionDialog()
  removeQuestion(questionId)

  try {
    await wrap(clientApi.deleteQuestion(questionId))
  } catch {
    if (listedQuestion !== undefined) {
      restoreQuestion(listedQuestion, listedQuestionIndex)
    }
    toast.error('Could not delete the question')

    return
  }

  if (urlAtom().pathname === questionPath(questionId)) {
    initQuestion(null)
    urlAtom.go(QUESTIONS_PATH)
  }

  try {
    const { questions } = await wrap(clientApi.loadQuestions())

    initQuestionList(questions)
  } catch {
    return
  }
}, 'deleteQuestion').extend(withAsync())
