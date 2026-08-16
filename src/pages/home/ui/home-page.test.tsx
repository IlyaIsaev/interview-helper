import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { expect, test } from 'vitest'

import { HomePage } from './home-page'

test('home page mounts without visible content', () => {
  const container = document.createElement('div')

  document.body.append(container)

  flushSync(() => {
    createRoot(container).render(<HomePage />)
  })

  expect(container.textContent).toBe('')
})
