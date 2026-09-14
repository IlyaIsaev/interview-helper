import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { QuestionPreview } from '../question-preview'

test('should render markdown when the preview is open with a question', async () => {
  const screen = await render(
    <QuestionPreview
      open
      question={{ question: '# Hello', answer: 'hidden answer' }}
      onOpenChange={() => {}}
    />,
  )

  await expect.element(screen.getByRole('dialog')).toBeVisible()
  await expect.element(screen.getByRole('heading', { name: 'Hello' })).toBeVisible()
  await expect.element(screen.getByText('hidden answer')).toBeVisible()
  await expect.element(screen.getByText('# Hello')).not.toBeInTheDocument()
})

test('should show loading when the preview is open without a question', async () => {
  const screen = await render(
    <QuestionPreview open question={null} onOpenChange={() => {}} />,
  )

  await expect.element(screen.getByRole('dialog')).toBeVisible()
  await expect.element(screen.getByText('loading')).toBeVisible()
})

test('should call onOpenChange when close is clicked', async () => {
  const opens: Array<boolean> = []
  const screen = await render(
    <QuestionPreview
      open
      question={{ question: 'Question text', answer: 'Answer text' }}
      onOpenChange={(open) => {
        opens.push(open)
      }}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Close' }))

  expect(opens).toEqual([false])
})
