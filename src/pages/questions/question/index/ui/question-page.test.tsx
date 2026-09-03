import { urlAtom } from '@reatom/core'
import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { initQuestion, initQuestionList } from '@/entities/question'
import { questionPath } from '@/shared/config'

import { isAnswerVisible } from '../model/show-answer'
import QuestionPage from './question-page'

const currentQuestionId = '11111111-1111-1111-1111-111111111111'
const otherQuestionId = '22222222-2222-2222-2222-222222222222'

const openQuestionPage = (questionCount: 'one' | 'two') => {
  isAnswerVisible.setFalse()
  urlAtom.go(questionPath(currentQuestionId))
  initQuestion({
    question: '# Hello',
    answer: 'hidden answer',
  })
  initQuestionList(
    questionCount === 'two'
      ? [
          { id: currentQuestionId, question: '# Hello' },
          { id: otherQuestionId, question: 'Other' },
        ]
      : [{ id: currentQuestionId, question: '# Hello' }],
  )
}

test('question page renders markdown for the question', async () => {
  openQuestionPage('one')

  const screen = await render(<QuestionPage />)

  await expect.element(screen.getByRole('heading', { name: 'Hello' })).toBeVisible()
  await expect.element(screen.getByText('# Hello')).not.toBeInTheDocument()
})

test('next question is hidden until the answer is visible', async () => {
  openQuestionPage('two')

  const screen = await render(<QuestionPage />)

  await expect.element(screen.getByRole('button', { name: 'Show answer' })).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Next question' }))
    .not.toBeInTheDocument()
})

test('next question is visible after reveal when another question is loaded', async () => {
  openQuestionPage('two')

  const screen = await render(<QuestionPage />)

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await expect.element(screen.getByRole('button', { name: 'Next question' })).toBeVisible()
})

test('next question is hidden when the list has only the current question', async () => {
  openQuestionPage('one')

  const screen = await render(<QuestionPage />)

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await expect.element(screen.getByText('hidden answer')).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Next question' }))
    .not.toBeInTheDocument()
})
