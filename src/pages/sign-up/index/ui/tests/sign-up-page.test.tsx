import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { signUpForm } from '../../model/sign-up'
import SignUpPage from '../sign-up-page'

test('sign-up name validation appears on blur, not while typing', async () => {
  signUpForm.reset()

  const screen = await render(<SignUpPage />)
  const name = screen.getByRole('textbox', { name: 'name' })

  await userEvent.click(name)
  await userEvent.keyboard('a{Backspace}')

  await expect.element(screen.getByText('Enter a name')).not.toBeInTheDocument()

  await userEvent.keyboard('{Tab}')

  await expect.element(screen.getByText('Enter a name')).toBeVisible()
})

test('create account stays disabled until name, email, and password are valid', async () => {
  signUpForm.reset()

  const screen = await render(<SignUpPage />)
  const createAccount = screen.getByRole('button', { name: 'Create account' })

  await expect.element(createAccount).toBeDisabled()

  await userEvent.click(screen.getByRole('textbox', { name: 'name' }))
  await userEvent.keyboard('Ada')
  await userEvent.click(screen.getByRole('textbox', { name: 'email' }))
  await userEvent.keyboard('ada@example.com')
  await userEvent.click(screen.getByRole('textbox', { name: 'password' }))
  await userEvent.keyboard('password1')

  await expect.element(createAccount).toBeEnabled()
})
