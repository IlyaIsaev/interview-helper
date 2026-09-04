import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { isAnswerVisible } from '../../model/show-answer'
import { ShowAnswer } from '../show-answer'

test('show answer button is focused and enter reveals the answer', async () => {
  isAnswerVisible.setFalse()

  const screen = await render(<ShowAnswer answer="Feature-Sliced Design" />)
  const showAnswer = screen.getByRole('button', { name: 'Show answer' })

  await expect.element(showAnswer).toBeVisible()
  await expect.element(showAnswer).toHaveFocus()

  await userEvent.keyboard('{Enter}')

  await expect.element(screen.getByText('Feature-Sliced Design')).toBeVisible()
  await expect.element(showAnswer).not.toBeInTheDocument()
})

test('show answer renders markdown instead of raw syntax', async () => {
  isAnswerVisible.setFalse()

  const screen = await render(<ShowAnswer answer="**bold**" />)
  const showAnswer = screen.getByRole('button', { name: 'Show answer' })

  await expect.element(showAnswer).toBeVisible()
  await userEvent.keyboard('{Enter}')

  await expect.element(screen.getByText('bold')).toBeVisible()
  await expect.element(screen.getByText('**bold**')).not.toBeInTheDocument()
  await expect.element(showAnswer).not.toBeInTheDocument()
})
