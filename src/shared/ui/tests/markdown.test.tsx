import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Markdown, markdownPlainText } from '../markdown'

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

test('markdownPlainText strips markup to visible text', () => {
  expect(markdownPlainText('# Hello')).toBe('Hello')
  expect(markdownPlainText('**bold**')).toBe('bold')
  expect(markdownPlainText('[Hello](https://example.com)')).toBe('Hello')
  expect(markdownPlainText('# Hello field\n\n**bold**')).toBe('Hello field bold')
  expect(markdownPlainText('# DDD\n## dddddd\n```tsx\nconst x = 1\n```')).toBe(
    'DDD dddddd const x = 1',
  )
})

test('markdown links keep https hrefs with rel and referrer policy', async () => {
  const screen = await render(<Markdown>{'[Hello](https://example.com)'}</Markdown>)
  const link = screen.getByRole('link', { name: 'Hello' })

  await expect.element(link).toBeVisible()
  await expect.element(link).toHaveAttribute('href', 'https://example.com')
  await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer nofollow')
  await expect.element(link).toHaveAttribute('referrerpolicy', 'no-referrer')
})

test('markdown drops javascript urls and does not render images', async () => {
  const screen = await render(
    <Markdown>{'[bad](javascript:alert(1))\n\n![](https://example.com/pixel.png)'}</Markdown>,
  )

  await expect.element(screen.getByRole('link', { name: 'bad' })).not.toBeInTheDocument()
  await expect.element(screen.getByRole('img')).not.toBeInTheDocument()
})

test('fenced typescript is syntax highlighted', async () => {
  const screen = await render(<Markdown>{'```ts\nconst x = 1\n```'}</Markdown>)
  const keyword = screen.getByText('const')

  await expect.element(keyword).toBeVisible()
  await expect.element(keyword).toHaveClass('hljs-keyword')
  await expect.element(screen.getByText('```ts')).not.toBeInTheDocument()
})
