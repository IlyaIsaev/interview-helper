import { action, atom, reatomString } from '@reatom/core'
import { filter, flatten, map, pick, pipe } from 'es-toolkit/fp'
import type { DeepReadonly } from 'es-toolkit/types'

export type QuestionListItem = DeepReadonly<{
  id: string
  question: string
}>

export const questionList = atom<Array<QuestionListItem> | null>(
  null,
  'questionList',
)

export const questionListQuery = reatomString('', 'questionListQuery')

const questionListItem = (question: QuestionListItem) =>
  pipe(question, pick(['id', 'question']))

export const initQuestionList = action((questions: Array<QuestionListItem>) => {
  questionList.set(pipe(questions, map(questionListItem)))
}, 'initQuestionList')

export const resetQuestionList = action(() => {
  questionList.set(null)
  questionListQuery.set('')
}, 'resetQuestionList')

export const addQuestion = action((question: QuestionListItem) => {
  questionList.set(pipe([questionList() ?? [], [question]], flatten()))
}, 'addQuestion')

export const updateQuestion = action((question: QuestionListItem) => {
  const replaceQuestion = (row: QuestionListItem) =>
    row.id === question.id ? question : row

  questionList.set(pipe(questionList() ?? [], map(replaceQuestion)))
}, 'updateQuestion')

export const removeQuestion = action((questionId: string) => {
  const isOtherQuestion = (row: QuestionListItem) => row.id !== questionId

  questionList.set(pipe(questionList() ?? [], filter(isOtherQuestion)))
}, 'removeQuestion')

export const restoreQuestion = action(
  (question: QuestionListItem, atIndex: number) => {
    questionList.set(
      (questionList() ?? []).toSpliced(atIndex, 0, questionListItem(question)),
    )
  },
  'restoreQuestion',
)
