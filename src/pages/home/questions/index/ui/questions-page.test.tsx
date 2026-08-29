import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { expect, test } from 'vitest'

import { initQuestionList } from '@/entities/questions/sidebar'

import QuestionsPage from './questions-page'

test('empty questions page shows create question', () => {
  initQuestionList([])

  const container = document.createElement('div')

  document.body.append(container)

  flushSync(() => {
    createRoot(container).render(<QuestionsPage />)
  })

  expect(container.textContent?.toLowerCase()).toContain(
    'the questions list is empty',
  )
  expect(container.textContent).toContain('Create question')
})
