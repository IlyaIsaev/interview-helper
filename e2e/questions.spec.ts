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
