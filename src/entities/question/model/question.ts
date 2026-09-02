import { action, atom } from '@reatom/core'
import { pick, pipe } from 'es-toolkit/fp'
import type { DeepReadonly } from 'es-toolkit/types'

export type Question = DeepReadonly<{
  question: string
  answer: string
}>

export const question = atom<Question | null>(null, 'question')

export const initQuestion = action((nextQuestion: Question | null) => {
  if (!nextQuestion) {
    question.set(null)

    return
  }

  question.set(pipe(nextQuestion, pick(['question', 'answer'])))
}, 'initQuestion')
