import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { changePasswordForm } from '../../model/change-password'
import { ChangePasswordForm } from '../change-password-form'

test('should render the password fields, submit, and delete slot when the form mounts', async () => {
  changePasswordForm.reset()

  const screen = await render(
    <ChangePasswordForm deleteUser={<button type="button">Delete account</button>} />,
  )

  await expect
    .element(screen.getByLabelText('new password', { exact: true }))
    .toBeVisible()
  await expect.element(screen.getByLabelText('new password confirmation')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Change password' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Delete account' })).toBeVisible()
  await expect.element(screen.getByLabelText('current password')).not.toBeInTheDocument()
})

test('should not show confirmation validation when the field is blurred without changes', async () => {
  changePasswordForm.reset()

  const screen = await render(
    <ChangePasswordForm deleteUser={<button type="button">Delete account</button>} />,
  )
  const confirmation = screen.getByLabelText('new password confirmation')

  await userEvent.click(confirmation)
  await userEvent.keyboard('{Tab}')

  await expect.element(screen.getByText('Passwords do not match')).not.toBeInTheDocument()
  await expect.element(screen.getByText('Confirm the password')).not.toBeInTheDocument()
})

test('should show a mismatch error when confirmation is blurred with a different password', async () => {
  changePasswordForm.reset()

  const screen = await render(
    <ChangePasswordForm deleteUser={<button type="button">Delete account</button>} />,
  )

  await userEvent.click(screen.getByLabelText('new password', { exact: true }))
  await userEvent.keyboard('password1')
  await userEvent.click(screen.getByLabelText('new password confirmation'))
  await userEvent.keyboard('password2')

  await expect.element(screen.getByText('Passwords do not match')).not.toBeInTheDocument()

  await userEvent.keyboard('{Tab}')

  await expect.element(screen.getByText('Passwords do not match')).toBeVisible()
})
