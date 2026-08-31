import {
  action,
  atom,
  reatomBoolean,
  reatomForm,
  urlAtom,
  withCallHook,
  wrap,
} from '@reatom/core'

import {
  currentQuestion,
  initQuestion,
  initQuestionList,
  questionList,
  updateQuestion,
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

export const closeUpdateQuestionDialog = action(() => {
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
    onSubmit: async ({ question, answer }) => {
      const questionId = questionBeingUpdated()

      if (!questionId) {
        return
      }

      const listedQuestion = (questionList() ?? []).find(
        (listedQuestion) => listedQuestion.id === questionId,
      )
      const shouldUpdateOpenedQuestion =
        urlAtom().pathname === questionPath(questionId)
      const openedQuestion = shouldUpdateOpenedQuestion
        ? currentQuestion()
        : undefined

      closeUpdateQuestionDialog()
      updateQuestion({ id: questionId, question })

      if (shouldUpdateOpenedQuestion) {
        initQuestion({ question, answer })
      }

      try {
        const updatedQuestion = await wrap(
          clientApi.updateQuestion(questionId, { question, answer }),
        )

        updateQuestion({
          id: updatedQuestion.id,
          question: updatedQuestion.question,
        })

        if (shouldUpdateOpenedQuestion) {
          initQuestion({
            question: updatedQuestion.question,
            answer: updatedQuestion.answer,
          })
        }

        try {
          const { questions } = await wrap(clientApi.loadQuestions())

          initQuestionList(questions)
        } catch {
          return updatedQuestion
        }

        return updatedQuestion
      } catch {
        if (listedQuestion) {
          updateQuestion(listedQuestion)
        }

        if (shouldUpdateOpenedQuestion) {
          initQuestion(openedQuestion ?? null)
        }

        toast.error('Could not update the question')
      }
    },
  },
)

export const openUpdateQuestion = action(async (questionId: string) => {
  questionBeingUpdated.set(questionId)
  isUpdateQuestionDialogOpen.setTrue()

  const question = await wrap(clientApi.loadQuestion(questionId))

  if (!question) {
    closeUpdateQuestionDialog()

    return
  }

  updateQuestionForm.fields.question.change(question.question)
  updateQuestionForm.fields.answer.change(question.answer)
}, 'openUpdateQuestion')

updateQuestionForm.submit.onFulfill.extend(
  withCallHook(({ payload: updatedQuestion }) => {
    if (!updatedQuestion) {
      return
    }

    urlAtom.go(questionPath(updatedQuestion.id))
  }),
)
