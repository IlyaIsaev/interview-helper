import { expect, test } from '@playwright/test'

test('guests opening questions routes are redirected to sign-in', async ({
  page,
}) => {
  await page.goto('/questions')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

  await page.goto('/questions/abc')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('signed-in users see the questions pages without losing home', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()

  await page.goto('/questions')

  await expect(page).toHaveURL(/\/questions$/)
  await expect(page.getByRole('heading', { name: 'Questions' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Home' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()

  await page.goto('/questions/abc')

  await expect(page).toHaveURL(/\/questions\/abc$/)
  await expect(page.getByRole('heading', { name: 'Question' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Questions' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()

  await page.goto('/')

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
})

test('sidebar plus opens the create question form from home and questions', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create question' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Create question' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Create question' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.goto('/questions')

  await expect(page).toHaveURL(/\/questions$/)
  await expect(page.getByRole('heading', { name: 'Questions' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Create question' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Create question' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Create question' }),
  ).toBeVisible()
})

test('creating a question from the sidebar goes to the new question page', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible({
    timeout: 15_000,
  })

  await page.getByRole('button', { name: 'Create question' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill('What is FSD?')
  await page.getByRole('textbox', { name: 'answer' }).fill('Feature-Sliced Design')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Question' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('mobile sidebar sheet shows Questions and opens create form', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible({
    timeout: 15_000,
  })

  await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
  const sidebarSheet = page.getByRole('dialog').filter({ hasText: 'Questions' })

  await expect(sidebarSheet.getByText('Questions', { exact: true })).toBeVisible()
  await expect(
    sidebarSheet.getByRole('button', { name: 'Create question' }),
  ).toBeVisible()

  await sidebarSheet.getByRole('button', { name: 'Create question' }).click()
  await expect(
    page.getByRole('heading', { name: 'Create question' }),
  ).toBeVisible()
})
