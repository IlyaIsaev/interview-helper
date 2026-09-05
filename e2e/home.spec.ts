import { expect, test, type Page } from '@playwright/test'

const signedInPath = /\/questions(\/[0-9a-f-]+)?$/

const demoEmail = /demo-user-[a-f0-9]{8}@demo\.com/

const isQuestionsListPath = (url: string) =>
  new URL(url).pathname === '/questions'

const notifications = (page: Page) =>
  page.getByRole('region', { name: /Notifications/i })

const createDemoAccount = async (page: Page) => {
  await page.goto('/sign-in')

  await expect(page.getByLabel('email')).toHaveValue(demoEmail)

  const email = await page.getByLabel('email').inputValue()
  const password = await page.getByLabel('password').inputValue()

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(signedInPath, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()

  return { email, password }
}

test('opening the app redirects guests to sign-in', async ({ page }) => {
  const demoUserGets: string[] = []
  const demoUserPosts: string[] = []
  const signUpRequests: string[] = []

  page.on('requestfinished', (request) => {
    if (request.url().includes('/api/demo-user') && request.method() === 'GET') {
      demoUserGets.push(request.url())
    }
  })

  page.on('request', (request) => {
    if (request.url().includes('/api/demo-user') && request.method() === 'POST') {
      demoUserPosts.push(request.url())
    }

    if (request.url().includes('/api/auth/sign-up/email')) {
      signUpRequests.push(request.url())
    }
  })

  await page.goto('/')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('email')).toHaveValue(demoEmail)
  await expect(page.getByLabel('password')).not.toHaveValue('')
  await expect(page.getByRole('heading', { name: 'We use cookies' })).toBeVisible()
  await expect(notifications(page).getByText('Demo user created.')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Sign up' })).toHaveCount(0)
  expect(demoUserGets).toHaveLength(1)
  expect(demoUserPosts).toEqual([])
  expect(signUpRequests).toEqual([])
})

test('signing in creates the demo user and lands on questions', async ({
  page,
}) => {
  await createDemoAccount(page)

  if (isQuestionsListPath(page.url())) {
    await expect(page.getByRole('heading', { name: 'Questions' })).toBeVisible()
    await expect(page.getByText('the questions list is empty')).toBeVisible()
  }

  await page.getByRole('button', { name: 'Demo user' }).click()
  await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Log Out' })).toBeVisible()

  await page.reload()

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
})

test('signing out returns to sign-in with the same demo user', async ({
  page,
}) => {
  const { email, password } = await createDemoAccount(page)

  await page.getByRole('button', { name: 'Demo user' }).click()
  await page.getByRole('menuitem', { name: 'Log Out' }).click()

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByLabel('email')).toHaveValue(email)
  await expect(page.getByLabel('password')).toHaveValue(password)
  await expect(notifications(page).getByText('Demo user created.')).toHaveCount(0)

  await page.reload()

  await expect(page.getByLabel('email')).toHaveValue(email)
  await expect(page.getByLabel('password')).toHaveValue(password)
  await expect(notifications(page).getByText('Demo user created.')).toHaveCount(0)

  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(signedInPath, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
})

test('user menu name opens the profile page without a sidebar', async ({
  page,
}) => {
  const { email } = await createDemoAccount(page)

  await page.getByRole('button', { name: 'Demo user' }).click()
  await page.getByRole('menuitem', { name: 'Profile' }).click()

  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByRole('heading', { name: 'Demo user' })).toBeVisible()
  await expect(page.getByRole('paragraph').filter({ hasText: email })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Toggle Sidebar' })).toHaveCount(
    0,
  )
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Interview helper' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()

  await page.getByRole('link', { name: 'Interview helper' }).click()

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
})

test('guests opening profile are redirected to sign-in', async ({ page }) => {
  await page.goto('/profile')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('signed-in users opening sign-in are sent to questions', async ({
  page,
}) => {
  await createDemoAccount(page)

  await page.goto('/sign-in')

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0)
})

test('cancelling account deletion stays on profile', async ({ page }) => {
  await createDemoAccount(page)

  await page.getByRole('button', { name: 'Demo user' }).click()
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
  await expect(page.getByRole('heading', { name: 'Demo user' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
})

test('deleting the account prefills a new demo user', async ({ page }) => {
  const { email: deletedEmail } = await createDemoAccount(page)

  await page.getByRole('button', { name: 'Demo user' }).click()
  await page.getByRole('menuitem', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/profile$/)

  await page.getByRole('button', { name: 'Delete account' }).click()
  await expect(page.getByRole('heading', { name: 'Delete account' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page).toHaveURL(/\/sign-in$/, { timeout: 15_000 })
  await expect(page.getByLabel('email')).toHaveValue(demoEmail)
  await expect(page.getByLabel('email')).not.toHaveValue(deletedEmail)
  await expect(page.getByLabel('password')).not.toHaveValue('')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

  const demoUserPosts: string[] = []

  page.on('request', (request) => {
    if (request.url().includes('/api/demo-user') && request.method() === 'POST') {
      demoUserPosts.push(request.url())
    }
  })

  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(signedInPath, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
  expect(demoUserPosts.length).toBeGreaterThan(0)
})

test('sign-up stays empty and does not fetch demo credentials', async ({
  page,
}) => {
  const demoUserGets: string[] = []

  page.on('request', (request) => {
    if (request.url().includes('/api/demo-user') && request.method() === 'GET') {
      demoUserGets.push(request.url())
    }
  })

  await page.goto('/sign-up')

  await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible()
  await expect(page.getByLabel('name')).toHaveValue('')
  await expect(page.getByLabel('email')).toHaveValue('')
  await expect(page.getByLabel('password')).toHaveValue('')
  expect(demoUserGets).toEqual([])
})
