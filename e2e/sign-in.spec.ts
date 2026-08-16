import { expect, test } from '@playwright/test'

test('sign-in page shows cookie consent', async ({ page }) => {
  await page.goto('/sign-in')

  await expect(page.getByRole('heading', { name: 'We use cookies' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible()
})

test('accepting cookies hides the consent banner', async ({ page }) => {
  await page.goto('/sign-in')

  await page.getByRole('button', { name: 'Accept' }).click()

  await expect(page.getByRole('heading', { name: 'We use cookies' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.evaluate(() => document.cookie)).resolves.toContain(
    'cookieConsent=true',
  )

  await page.reload()

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'We use cookies' })).toHaveCount(0)
})

test('declining cookies leaves for Google without deleting a user', async ({
  page,
}) => {
  const deleteRequests: string[] = []

  page.on('request', (request) => {
    if (request.url().includes('/api/demo-user') && request.method() === 'DELETE') {
      deleteRequests.push(request.url())
    }
  })

  await page.goto('/sign-in')
  await page.getByRole('button', { name: 'Decline' }).click()

  await expect(page).toHaveURL(/google\.com/)
  expect(deleteRequests).toEqual([])
})
