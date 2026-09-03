import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Markdown } from './markdown'

test('renders markdown instead of raw syntax', async () => {
  const screen = await render(<Markdown>{'# Hello\n\n**bold**'}</Markdown>)

  await expect.element(screen.getByRole('heading', { name: 'Hello' })).toBeVisible()
  await expect.element(screen.getByText('bold')).toBeVisible()
  await expect.element(screen.getByText('# Hello')).not.toBeInTheDocument()
  await expect.element(screen.getByText('**bold**')).not.toBeInTheDocument()
})

test('plain markdown is text without elements', async () => {
  const screen = await render(<Markdown plain>{'# Hello\n\n**bold**'}</Markdown>)

  await expect.element(screen.getByText(/Hello\s+bold/)).toBeVisible()
  await expect.element(screen.getByRole('heading')).not.toBeInTheDocument()
  await expect.element(screen.getByText('# Hello')).not.toBeInTheDocument()
  await expect.element(screen.getByText('**bold**')).not.toBeInTheDocument()
})

test('plain markdown links are text inside a parent link', async () => {
  const screen = await render(
    <a href="/questions/1">
      <Markdown plain>{'[Hello](https://example.com)'}</Markdown>
    </a>,
  )

  await expect.element(screen.getByRole('link', { name: 'Hello' })).toBeVisible()
  await expect
    .element(screen.getByRole('link', { name: 'Hello' }))
    .toHaveAttribute('href', '/questions/1')
})
