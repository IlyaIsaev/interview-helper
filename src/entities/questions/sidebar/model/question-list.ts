import { action, atom, withAsync, wrap } from '@reatom/core'

import { clientApi } from '@/shared/api'

export type QuestionListItem = {
  id: string
  question: string
}

export const questionList = atom<Array<QuestionListItem>>([], 'questionList')

export const loadQuestionList = action(async () => {
  const { questions } = await wrap(clientApi.loadQuestions())
  const items = questions.map(({ id, question }) => ({
    id,
    question,
  }))

  questionList.set(items)

  return items
}, 'loadQuestionList').extend(withAsync())

export const addQuestion = action((item: QuestionListItem) => {
  questionList.set([...questionList(), item])
  loadQuestionList()
}, 'addQuestion')
