import { action, atom } from '@reatom/core'

export type Question = {
  question: string
  answer: string
}

export const currentQuestion = atom<Question | null>(null, 'currentQuestion')

export const initQuestion = action((question: Question | null) => {
  if (!question) {
    currentQuestion.set(null)

    return
  }

  currentQuestion.set({
    question: question.question,
    answer: question.answer,
  })
}, 'initQuestion')
