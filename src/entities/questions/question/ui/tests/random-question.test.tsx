import { urlAtom } from '@reatom/core'
import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { initQuestion, initQuestions } from '@/entities/questions/question'
import { questionPath } from '@/shared/config'

import { isAnswerVisible } from '../../model/show-answer'
import { RandomQuestion } from '../random-question'

const currentQuestionId = '11111111-1111-1111-1111-111111111111'
const otherQuestionId = '22222222-2222-2222-2222-222222222222'

const openRandomQuestion = (questionCount: 'one' | 'two') => {
  isAnswerVisible.setFalse()
  urlAtom.go(questionPath(currentQuestionId))
  initQuestion({
    id: currentQuestionId,
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

test('should render markdown when the question opens', async () => {
  openRandomQuestion('one')

  const screen = await render(<RandomQuestion />)

  await expect.element(screen.getByRole('heading', { name: 'Hello' })).toBeVisible()
  await expect.element(screen.getByText('# Hello')).not.toBeInTheDocument()
})

test('should reveal the answer when enter is pressed on the focused button', async () => {
  openRandomQuestion('one')

  const screen = await render(<RandomQuestion />)
  const showAnswer = screen.getByRole('button', { name: 'Show answer' })

  await expect.element(showAnswer).toBeVisible()
  await expect.element(showAnswer).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  await expect.element(screen.getByText('hidden answer')).toBeVisible()
  await expect.element(showAnswer).not.toBeInTheDocument()
})

test('should render markdown when the answer is revealed', async () => {
  isAnswerVisible.setFalse()
  urlAtom.go(questionPath(currentQuestionId))
  initQuestion({
    id: currentQuestionId,
    question: '# Hello',
    answer: '**bold**',
  })
  initQuestions([{ id: currentQuestionId, question: '# Hello' }])

  const screen = await render(<RandomQuestion />)
  const showAnswer = screen.getByRole('button', { name: 'Show answer' })

  await expect.element(showAnswer).toBeVisible()
  await userEvent.keyboard('{Enter}')

  await expect.element(screen.getByText('bold')).toBeVisible()
  await expect.element(screen.getByText('**bold**')).not.toBeInTheDocument()
  await expect.element(showAnswer).not.toBeInTheDocument()
})

test('should hide next question when the answer is still hidden', async () => {
  openRandomQuestion('two')

  const screen = await render(<RandomQuestion />)

  await expect.element(screen.getByRole('button', { name: 'Show answer' })).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Next question' }))
    .not.toBeInTheDocument()
})

test('should reveal the answer without a separator when show answer is clicked', async () => {
  openRandomQuestion('one')

  const screen = await render(<RandomQuestion />)
  const separator = screen.getByRole('separator')

  await expect.element(separator).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await expect.element(separator).not.toBeInTheDocument()
  await expect.element(screen.getByText('hidden answer')).toBeVisible()
})

test('should focus next question when the answer is revealed and another question is loaded', async () => {
  openRandomQuestion('two')

  const screen = await render(<RandomQuestion />)

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  const nextQuestion = screen.getByRole('button', { name: 'Next question' })

  await expect.element(nextQuestion).toBeVisible()
  await expect.element(nextQuestion).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  expect(urlAtom().pathname).toBe(questionPath(otherQuestionId))
})

test('should hide next question when the list has only the current question', async () => {
  openRandomQuestion('one')

  const screen = await render(<RandomQuestion />)

  await userEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await expect.element(screen.getByText('hidden answer')).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Next question' }))
    .not.toBeInTheDocument()
})
