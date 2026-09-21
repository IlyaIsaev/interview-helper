import { expect, test, type Page } from '@playwright/test'

import {
  createAccount,
  e2eUserName,
  openUserMenu,
  signedInPath,
  signInWithCredentials,
  submitSignUp,
} from './auth'

const isQuestionsPath = (url: string) =>
  new URL(url).pathname === '/questions'

const notifications = (page: Page) =>
  page.getByRole('region', { name: /Notifications/i })

test('opening the app redirects guests to sign-in', async ({ page }) => {
  const demoUserRequests: Array<string> = []
  const signUpRequests: Array<string> = []

  page.on('request', (request) => {
    if (request.url().includes('/api/demo-user')) {
      demoUserRequests.push(request.url())
    }

    if (request.url().includes('/api/auth/sign-up/email')) {
      signUpRequests.push(request.url())
    }
  })

  await page.goto('/')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')
  await expect(page.getByRole('heading', { name: 'We use cookies' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible()
  expect(demoUserRequests).toEqual([])
  expect(signUpRequests).toEqual([])
})

test('signing up creates an account and lands on questions', async ({
  page,
}) => {
  await createAccount(page)

  if (isQuestionsPath(page.url())) {
    await expect(page.getByRole('heading', { name: 'Questions' })).toBeVisible()
    await expect(page.getByText('the questions list is empty')).toBeVisible()
  }

  await openUserMenu(page)
  await expect(page.getByRole('menuitem', { name: 'Questions' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Theory' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Log Out' })).toBeVisible()

  await page.reload()

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: e2eUserName })).toBeVisible()
})

test('signing out returns to empty sign-in and can sign in again', async ({
  page,
}) => {
  const account = await createAccount(page)

  await openUserMenu(page)
  await page.getByRole('menuitem', { name: 'Log Out' }).click()

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')

  await page.reload()

  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')

  await signInWithCredentials(page, account)
})

test('user menu name opens the profile page without a sidebar', async ({
  page,
}) => {
  const { email } = await createAccount(page)

  await openUserMenu(page)
  await page.getByRole('menuitem', { name: 'Profile' }).click()

  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('heading', { name: e2eUserName })).toBeVisible()
  await expect(page.getByRole('paragraph').filter({ hasText: email })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Toggle Sidebar' })).toHaveCount(
    0,
  )
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Interview helper' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: e2eUserName })).toBeVisible()

  const loadQuestionsRequests: Array<string> = []

  page.on('request', (request) => {
    if (request.method() !== 'GET') {
      return
    }

    if (new URL(request.url()).pathname === '/api/questions') {
      loadQuestionsRequests.push(request.url())
    }
  })

  await page.reload()

  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('heading', { name: e2eUserName })).toBeVisible()
  expect(loadQuestionsRequests).toEqual([])

  await page.getByRole('link', { name: 'Interview helper' }).click()

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: e2eUserName })).toBeVisible()
})

test('guests opening profile are redirected to sign-in', async ({ page }) => {
  await page.goto('/profile')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('signed-in users opening sign-in are sent to questions', async ({
  page,
}) => {
  await createAccount(page)

  await page.goto('/sign-in')

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0)
})

test('changing the password on profile signs in with the new password after log out', async ({
  page,
}) => {
  const account = await createAccount(page)

  await openUserMenu(page)
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/profile$/)

  const newPasswordInput = page.getByLabel('new password', { exact: true })
  const confirmationInput = page.getByLabel('new password confirmation')

  await expect(newPasswordInput).toBeVisible()
  await expect(confirmationInput).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete account' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible()
  await expect(page.getByLabel('current password')).toHaveCount(0)

  await newPasswordInput.fill('newpass1!')
  await confirmationInput.fill('mismatch1')
  await confirmationInput.blur()
  await expect(page.getByText('Passwords do not match')).toBeVisible()

  await confirmationInput.fill('newpass1!')
  await confirmationInput.blur()
  await page.getByRole('button', { name: 'Change password' }).click()

  await expect(notifications(page).getByText('Password changed.')).toBeVisible()
  await expect(page).toHaveURL(/\/profile$/)
  await expect(newPasswordInput).toHaveValue('')
  await expect(confirmationInput).toHaveValue('')

  await openUserMenu(page)
  await page.getByRole('menuitem', { name: 'Log Out' }).click()

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')

  await signInWithCredentials(page, {
    ...account,
    password: 'newpass1!',
  })
})

test('cancelling account deletion stays on profile', async ({ page }) => {
  await createAccount(page)

  await openUserMenu(page)
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/profile$/)

  await page.getByRole('button', { name: 'Delete account' }).click()
  await expect(page.getByRole('heading', { name: 'Delete account' })).toBeVisible()
  await expect(
    page.getByText(
      'This deletes your account and all of your questions. This cannot be undone.',
    ),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('heading', { name: e2eUserName })).toBeVisible()
  await expect(page.getByRole('button', { name: e2eUserName })).toBeVisible()
})

test('deleting the account returns to empty sign-in', async ({ page }) => {
  const account = await createAccount(page)

  await openUserMenu(page)
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/profile$/)

  await page.getByRole('button', { name: 'Delete account' }).click()
  await expect(page.getByRole('heading', { name: 'Delete account' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page).toHaveURL(/\/sign-in$/, { timeout: 15_000 })
  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

  await page.getByLabel('email').fill(account.email)
  await page.getByLabel('password').fill(account.password)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(
    notifications(page).getByText("This user doesn't exist anymore."),
  ).toBeVisible()
})

test('sign-up registers a new account', async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`
  const signUpRequests: Array<string> = []

  page.on('request', (request) => {
    if (request.url().includes('/api/auth/sign-up/email')) {
      signUpRequests.push(request.url())
    }
  })

  await page.goto('/sign-up')

  await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible()
  await expect(page.getByLabel('name')).toHaveValue('')
  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')

  await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled()

  await page.getByLabel('name').fill(e2eUserName)
  await page.getByLabel('email').fill(email)
  await page.getByLabel('password').fill('password1')
  await submitSignUp(page, {
    name: e2eUserName,
    email,
    password: 'password1',
  })

  await expect(page.getByRole('button', { name: e2eUserName })).toBeVisible()
  expect(signUpRequests.length).toBeGreaterThan(0)
})
