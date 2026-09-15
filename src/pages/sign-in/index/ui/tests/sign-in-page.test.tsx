import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { signInForm } from '../../model/sign-in'
import SignInPage from '../sign-in-page'

test('should link to sign-up and omit demo expiry copy when the sign-in page renders', async () => {
  const screen = await render(<SignInPage />)

  await expect.element(screen.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect.element(screen.getByRole('link', { name: 'Sign up' })).toBeVisible()
  await expect
    .element(screen.getByText('demo accounts are deleted after 24 hours'))
    .not.toBeInTheDocument()
})

test('should not show email validation when the field is blurred without changes', async () => {
  signInForm.reset()

  const screen = await render(<SignInPage />)
  const email = screen.getByRole('textbox', { name: 'email' })

  await userEvent.click(email)
  await userEvent.keyboard('{Tab}')

  await expect.element(screen.getByText('Enter an email')).not.toBeInTheDocument()
  await expect.element(screen.getByText('Enter a valid email')).not.toBeInTheDocument()
})

test('should show email validation when the field is blurred with invalid input', async () => {
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
