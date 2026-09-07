import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { signInForm } from '../../model/sign-in'
import SignInPage from '../sign-in-page'

test('sign-in links to sign-up and does not mention 24 hour demo expiry', async () => {
  const screen = await render(<SignInPage />)

  await expect.element(screen.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect.element(screen.getByRole('link', { name: 'Sign up' })).toBeVisible()
  await expect
    .element(screen.getByText('demo accounts are deleted after 24 hours'))
    .not.toBeInTheDocument()
})

test('sign-in email validation appears on blur, not while typing', async () => {
  signInForm.reset()

  const screen = await render(<SignInPage />)
  const email = screen.getByRole('textbox', { name: 'email' })

  await userEvent.click(email)
  await userEvent.keyboard('not-an-email')

  await expect.element(screen.getByText('Enter a valid email')).not.toBeInTheDocument()
  await expect.element(screen.getByText('Enter an email')).not.toBeInTheDocument()

  await userEvent.keyboard('{Tab}')

  await expect.element(screen.getByText('Enter a valid email')).toBeVisible()
})
