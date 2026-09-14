import { urlAtom } from '@reatom/core'
import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { initQuestion, initQuestions } from '@/entities/question'
import { questionPath } from '@/shared/config'

import { isAnswerVisible } from '../../model/show-answer'
import QuestionPage from '../question-page'

const currentQuestionId = '11111111-1111-1111-1111-111111111111'
const otherQuestionId = '22222222-2222-2222-2222-222222222222'

const openQuestionPage = (questionCount: 'one' | 'two') => {
  isAnswerVisible.setFalse()
  urlAtom.go(questionPath(currentQuestionId))
  initQuestion({
    question: '# Hello',
    answer: 'hidden answer',
  })
  initQuestions(
    questionCount === 'two'
      ? [
          { id: currentQuestionId, question: '# Hello' },
          { id: otherQuestionId, question: 'Other' },
        ]
      : [{ id: currentQuestionId, question: '# Hello' }],
  )
}

test('should render markdown when the question page opens', async () => {
  openQuestionPage('one')

  const screen = await render(<QuestionPage />)

  await expect.element(screen.getByRole('heading', { name: 'Hello' })).toBeVisible()
  await expect.element(screen.getByText('# Hello')).not.toBeInTheDocument()
})

test('should hide next question when the answer is still hidden', async () => {
  openQuestionPage('two')

  const screen = await render(<QuestionPage />)

  await expect.element(screen.getByRole('button', { name: 'Show answer' })).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Next question' }))
    .not.toBeInTheDocument()
})

test('should reveal the answer without a separator when show answer is clicked', async () => {
  openQuestionPage('one')

  const screen = await render(<QuestionPage />)
  const separator = screen.getByRole('separator')

  await expect.element(separator).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await expect.element(separator).not.toBeInTheDocument()
  await expect.element(screen.getByText('hidden answer')).toBeVisible()
})

test('should focus next question when the answer is revealed and another question is loaded', async () => {
  openQuestionPage('two')

  const screen = await render(<QuestionPage />)

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  const nextQuestion = screen.getByRole('button', { name: 'Next question' })

  await expect.element(nextQuestion).toBeVisible()
  await expect.element(nextQuestion).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expect(urlAtom().pathname).toBe(questionPath(otherQuestionId))
})

test('should hide next question when the list has only the current question', async () => {
  openQuestionPage('one')

  const screen = await render(<QuestionPage />)

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await expect.element(screen.getByText('hidden answer')).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Next question' }))
    .not.toBeInTheDocument()
})
