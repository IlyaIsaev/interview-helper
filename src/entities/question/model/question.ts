import { action, atom } from '@reatom/core'
import { pick, pipe } from 'es-toolkit/fp'
import type { DeepReadonly } from 'es-toolkit/types'

export type Question = DeepReadonly<{
  question: string
  answer: string
}>

export const currentQuestion = atom<Question | null>(null, 'currentQuestion')

export const initQuestion = action((question: Question | null) => {
  if (!question) {
    currentQuestion.set(null)

    return
  }

  currentQuestion.set(pipe(question, pick(['question', 'answer'])))
}, 'initQuestion')
