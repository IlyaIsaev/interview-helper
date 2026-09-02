import {
  action,
  atom,
  reatomBoolean,
  reatomForm,
  urlAtom,
  withAbort,
  withAsync,
  withCallHook,
  wrap,
} from '@reatom/core'
import { find, pipe } from 'es-toolkit/fp'

import {
  initQuestion,
  initQuestionList,
  question as openedQuestionState,
  questionList,
  updateQuestion,
  type QuestionListItem,
} from '@/entities/question'
import { questionFieldsSchema } from '@/features/questions/create-question'
import { clientApi } from '@/shared/api'
import { questionPath } from '@/shared/config'
import { toast } from '@/shared/ui'

export const questionBeingUpdated = atom<string | null>(
  null,
  'questionBeingUpdated',
)

export const isUpdateQuestionDialogOpen = reatomBoolean(
  false,
  'isUpdateQuestionDialogOpen',
)

const hasQuestionId =
  (questionId: string) =>
  (question: QuestionListItem): boolean =>
    question.id === questionId

export const closeUpdateQuestionDialog = action(() => {
  openUpdateQuestion.abort()
  isUpdateQuestionDialogOpen.setFalse()
  questionBeingUpdated.set(null)
  updateQuestionForm.reset()
}, 'closeUpdateQuestionDialog')

export const updateQuestionForm = reatomForm(
  {
    question: '',
    answer: '',
  },
  {
    name: 'updateQuestionForm',
    validateOnBlur: true,
    validateOnChange: true,
    schema: questionFieldsSchema,
    onSubmit: async ({ question: nextQuestion, answer: nextAnswer }) => {
      const questionId = questionBeingUpdated()

      if (!questionId) {
        return
      }

      const questions = questionList() ?? []
      const question = pipe(questions, find(hasQuestionId(questionId)))
      const isQuestionOpened = urlAtom().pathname === questionPath(questionId)
      const openedQuestion = isQuestionOpened
        ? openedQuestionState()
        : undefined
      const questionText = question?.question ?? openedQuestion?.question

      closeUpdateQuestionDialog()
      updateQuestion({ id: questionId, question: nextQuestion })

      if (isQuestionOpened) {
        initQuestion({ question: nextQuestion, answer: nextAnswer })
      }

      try {
        const updatedQuestion = await wrap(
          clientApi.updateQuestion(questionId, {
            question: nextQuestion,
            answer: nextAnswer,
          }),
        )

        updateQuestion({
          id: updatedQuestion.id,
          question: updatedQuestion.question,
        })

        if (isQuestionOpened) {
          initQuestion({
            question: updatedQuestion.question,
            answer: updatedQuestion.answer,
          })
        }

        toast.success('Question updated.', {
          description: questionText,
        })

        try {
          const { questions } = await wrap(clientApi.loadQuestions())

          initQuestionList(questions)
        } catch {
          return updatedQuestion
        }

        return updatedQuestion
      } catch {
        if (question) {
          updateQuestion(question)
        }

        if (isQuestionOpened) {
          initQuestion(openedQuestion ?? null)
        }

        toast.error('Could not update the question. Try again later.', {
          description: questionText,
        })
      }
    },
  },
)

export const openUpdateQuestion = action(async (questionId: string) => {
  questionBeingUpdated.set(questionId)
  isUpdateQuestionDialogOpen.setTrue()

  const nextQuestion = await wrap(clientApi.loadQuestion(questionId))

  if (!nextQuestion) {
    closeUpdateQuestionDialog()

    return
  }

  updateQuestionForm.fields.question.change(nextQuestion.question)
  updateQuestionForm.fields.answer.change(nextQuestion.answer)
}, 'openUpdateQuestion').extend(withAsync(), withAbort())

updateQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: updatedQuestion }) => {
    if (!updatedQuestion) {
      return
    }

    urlAtom.go(questionPath(updatedQuestion.id))
  }),
)
