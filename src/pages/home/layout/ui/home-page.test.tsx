import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import HomePage from './home-page'

test('home page mounts a session-aware shell', async () => {
  const screen = await render(<HomePage />)

  await expect.element(screen.getByRole('heading', { name: 'Home' })).toBeVisible()
})
