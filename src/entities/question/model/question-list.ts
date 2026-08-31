import { action, atom } from '@reatom/core'
import { filter, map, pick, pipe } from 'es-toolkit/fp'
import type { DeepReadonly } from 'es-toolkit/types'

export type QuestionListItem = DeepReadonly<{
  id: string
  question: string
}>

export const questionList = atom<Array<QuestionListItem> | null>(
  null,
  'questionList',
)

const questionListItem = (question: QuestionListItem) =>
  pipe(question, pick(['id', 'question']))

export const initQuestionList = action((questions: Array<QuestionListItem>) => {
  questionList.set(pipe(questions, map(questionListItem)))
}, 'initQuestionList')

export const resetQuestionList = action(() => {
  questionList.set(null)
}, 'resetQuestionList')

export const addQuestion = action((question: QuestionListItem) => {
  questionList.set([...(questionList() ?? []), question])
}, 'addQuestion')

export const updateQuestion = action((question: QuestionListItem) => {
  const listedQuestionWithUpdate = (listedQuestion: QuestionListItem) =>
    listedQuestion.id === question.id ? question : listedQuestion

  questionList.set(pipe(questionList() ?? [], map(listedQuestionWithUpdate)))
}, 'updateQuestion')

export const removeQuestion = action((questionId: string) => {
  const isKeptQuestion = (listedQuestion: QuestionListItem) =>
    listedQuestion.id !== questionId

  questionList.set(pipe(questionList() ?? [], filter(isKeptQuestion)))
}, 'removeQuestion')

export const restoreQuestion = action(
  (question: QuestionListItem, atIndex: number) => {
    questionList.set(
      (questionList() ?? []).toSpliced(atIndex, 0, questionListItem(question)),
    )
  },
  'restoreQuestion',
)
