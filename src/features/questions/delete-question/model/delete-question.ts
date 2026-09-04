import { action, atom, reatomBoolean, urlAtom, withAsync, wrap } from '@reatom/core'
import { findIndex, pipe } from 'es-toolkit/fp'

import {
  initQuestion,
  initQuestionList,
  questionList,
  questionListQuery,
  removeQuestion,
  restoreQuestion,
  type QuestionListItem,
} from '@/entities/question'
import { clientApi } from '@/shared/api'
import { questionPath, QUESTIONS_PATH } from '@/shared/config'
import { markdownPlainText, toast } from '@/shared/ui'

export const questionBeingDeleted = atom<string | null>(
  null,
  'questionBeingDeleted',
)

export const isDeleteQuestionDialogOpen = reatomBoolean(
  false,
  'isDeleteQuestionDialogOpen',
)

const hasQuestionId =
  (questionId: string) =>
  (question: QuestionListItem): boolean =>
    question.id === questionId

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

  const questions = questionList() ?? []
  const index = pipe(questions, findIndex(hasQuestionId(questionId)))
  const question = questions[index]
  const questionDescription =
    question === undefined ? undefined : markdownPlainText(question.question)

  closeDeleteQuestionDialog()
  removeQuestion(questionId)

  try {
    await wrap(clientApi.deleteQuestion(questionId))
  } catch {
    if (question !== undefined) {
      restoreQuestion(question, index)
    }
    toast.error('Could not delete the question. Try again later.', {
      description: questionDescription,
    })

    return
  }

  toast.success('Question deleted.', {
    description: questionDescription,
  })

  if (urlAtom().pathname === questionPath(questionId)) {
    initQuestion(null)
    urlAtom.go(QUESTIONS_PATH)
  }

  try {
    const { questions } = await wrap(clientApi.loadQuestions(questionListQuery()))

    initQuestionList(questions)
  } catch {
    return
  }
}, 'deleteQuestion').extend(withAsync())
