import { expect, test } from '@playwright/test'

test('opening the app redirects guests to sign-in', async ({ page }) => {
  const signUpRequests: string[] = []

  page.on('request', (request) => {
    if (request.url().includes('/api/auth/sign-up/email')) {
      signUpRequests.push(request.url())
    }
  })

  await page.goto('/')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('email')).toHaveValue(/demo-user-[a-f0-9]{8}@demo\.com/)
  await expect(page.getByLabel('password')).not.toHaveValue('')
  await expect(page.getByRole('heading', { name: 'We use cookies' })).toBeVisible()
  expect(signUpRequests).toEqual([])
})

test('signing in creates the demo user and shows home', async ({ page }) => {
  await page.goto('/')

  const email = await page.getByLabel('email').inputValue()

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Demo user' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText(email)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()

  await page.reload()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Demo user' })).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
})

test('signing out returns to sign-in with the same demo user', async ({
  page,
}) => {
  await page.goto('/')

  const email = await page.getByLabel('email').inputValue()
  const password = await page.getByLabel('password').inputValue()

  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Demo user' })).toBeVisible({
    timeout: 15_000,
  })

  const generatedCredentialRequests: string[] = []

  page.on('request', (request) => {
    if (request.url().includes('/api/demo-user') && request.method() === 'GET') {
      generatedCredentialRequests.push(request.url())
    }
  })

  await page.getByRole('button', { name: 'Sign out' }).click()

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByLabel('email')).toHaveValue(email)
  await expect(page.getByLabel('password')).toHaveValue(password)
  expect(generatedCredentialRequests).toEqual([])

  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Demo user' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText(email)).toBeVisible()
})
