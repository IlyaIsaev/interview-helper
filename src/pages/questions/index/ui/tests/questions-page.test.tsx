import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { initQuestionList } from '@/entities/question'

import QuestionsPage from '../questions-page'

test('empty questions page shows create question', async () => {
  initQuestionList([])

  const screen = await render(<QuestionsPage />)

  await expect.element(screen.getByRole('heading', { name: 'Questions' })).toBeVisible()
  await expect.element(screen.getByText('the questions list is empty')).toBeVisible()
  await expect
    .element(screen.getByRole('button', { name: 'Create question' }))
    .toBeVisible()
})
