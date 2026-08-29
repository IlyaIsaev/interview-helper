import { action, atom } from '@reatom/core'

export type QuestionListItem = {
  id: string
  question: string
}

export const questionList = atom<Array<QuestionListItem> | null>(
  null,
  'questionList',
)

export const initQuestionList = action((questions: Array<QuestionListItem>) => {
  questionList.set(
    questions.map(({ id, question }) => ({
      id,
      question,
    })),
  )
}, 'initQuestionList')

export const addQuestion = action((item: QuestionListItem) => {
  questionList.set([...(questionList() ?? []), item])
}, 'addQuestion')

export const updateQuestion = action((item: QuestionListItem) => {
  questionList.set(
    (questionList() ?? []).map((question) =>
      question.id === item.id ? item : question,
    ),
  )
}, 'updateQuestion')
