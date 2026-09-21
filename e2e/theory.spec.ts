import { expect, test, type Page, type Request } from '@playwright/test'

import { createAccount, e2eUserName } from './auth'

const signedInPath = /\/questions(\/[0-9a-f-]+)?$/

const openedQuestionUrl = /\/theory\?id=[0-9a-f-]+$/

const isTheoryPath = (url: string) => new URL(url).pathname === '/theory'

const openedQuestion = (page: Page, questionText: string) =>
  page.getByRole('button', { name: questionText, expanded: true })

const headerCreateQuestion = (page: Page) =>
  page
    .getByRole('button', { name: 'Create question' })
    .filter({ has: page.locator('svg') })

const listQuestion = (page: Page, questionText: string) =>
  page.getByRole('button', { name: questionText })

const questionItem = (page: Page, questionText: string) =>
  page.locator('[data-slot="accordion-item"]').filter({
    has: page.getByRole('button', { name: questionText }),
  })

const emptyCreateQuestion = (page: Page) =>
  page
    .getByRole('button', { name: 'Create question' })
    .filter({ hasText: 'Create question' })

const notifications = (page: Page) =>
  page.getByRole('region', { name: /Notifications/i })

const signIn = createAccount

const openTheory = async (page: Page) => {
  await page.getByRole('button', { name: e2eUserName }).click()
  await page.getByRole('menuitem', { name: 'Theory' }).click()
  await expect(page).toHaveURL(/\/theory(?:\?id=.+)?$/)
  await expect(page.getByRole('heading', { name: 'Theory' })).toBeVisible()
}

const fillCreateQuestion = async (
  page: Page,
  questionText: string,
  answerText: string,
) => {
  const dialog = page.getByRole('dialog')

  await dialog.getByRole('textbox', { name: 'question' }).fill(questionText)
  await dialog.getByRole('textbox', { name: 'answer' }).fill(answerText)
}

const createSubmit = (page: Page) =>
  page.getByRole('dialog').getByRole('button', { name: 'Create', exact: true })

const isCreateQuestionPost = (request: Request) => {
  if (request.method() !== 'POST') return false

  return new URL(request.url()).pathname === '/api/questions'
}

const failCreateQuestion = async (page: Page) => {
  await page.route('**/api/questions', async (route) => {
    if (isCreateQuestionPost(route.request())) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{}',
      })

      return
    }

    await route.continue()
  })
}

const failQuestionMutation = async (page: Page, method: 'PUT' | 'DELETE') => {
  await page.route('**/api/questions/*', async (route) => {
    if (route.request().method() === method) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{}',
      })

      return
    }

    await route.continue()
  })
}

test('guests opening theory are redirected to sign-in', async ({ page }) => {
  await page.goto('/theory')

  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('user menu opens theory without leaving the theory path', async ({
  page,
}) => {
  await signIn(page)
  await openTheory(page)

  await expect(page).toHaveURL(/\/theory$/)
  await expect(page.getByText('the questions list is empty')).toBeVisible()
  await expect(emptyCreateQuestion(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show answer' })).toHaveCount(0)
})

test('signed-in users can open a missing theory question', async ({ page }) => {
  await signIn(page)
  await openTheory(page)

  await page.evaluate(() => {
    const missingQuestionLink = document.createElement('a')
    missingQuestionLink.href = '/theory?id=abc'
    missingQuestionLink.click()
  })

  await expect(page).toHaveURL(/\/theory\?id=abc$/)
  await expect(page.getByRole('heading', { name: 'Theory' })).toBeVisible()
  await expect(page.getByText('question not found')).toBeVisible()
  await expect(page.getByRole('button', { name: e2eUserName })).toBeVisible()
})

test('creating a question from the theory header stays on theory', async ({
  page,
}) => {
  const questionText = `What is FSD? ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Feature-Sliced Design')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(isTheoryPath(page.url())).toBe(true)
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByText('Feature-Sliced Design')).toBeVisible()
  await expect(listQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(notifications(page).getByText('Question created.')).toBeVisible()
})

test('creating a question from the empty state stays on theory', async ({
  page,
}) => {
  const questionText = `Empty create ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await expect(page.getByText('the questions list is empty')).toBeVisible()

  await emptyCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Empty answer')
  await createSubmit(page).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByText('the questions list is empty')).toHaveCount(0)
})

test('a failed create keeps the dialog and shows an error', async ({ page }) => {
  const questionText = `Create fail ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  const listUrl = page.url()

  await failCreateQuestion(page)
  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Should not save')
  await createSubmit(page).click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    notifications(page).getByText(
      'Could not create the question. Try again later.',
    ),
  ).toBeVisible()
  await expect(page).toHaveURL(listUrl)
  await expect(listQuestion(page, questionText)).toHaveCount(0)
})

test('opening a question adds its id to the search params', async ({
  page,
}) => {
  const firstQuestion = `Accordion first ${Date.now()}`
  const secondQuestion = `Accordion second ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, firstQuestion, 'First answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(page.getByText('First answer')).toBeVisible()

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, secondQuestion, 'Second answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('region', { name: secondQuestion }).getByText('Second answer'),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: firstQuestion }).getByText('First answer'),
  ).toHaveCount(0)

  await listQuestion(page, firstQuestion).click()

  await expect(page).toHaveURL(openedQuestionUrl)
  await expect(isTheoryPath(page.url())).toBe(true)
  await expect(
    page.getByRole('region', { name: firstQuestion }).getByText('First answer'),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: secondQuestion }).getByText('Second answer'),
  ).toHaveCount(0)

  await listQuestion(page, firstQuestion).click()

  await expect(page).toHaveURL(/\/theory$/)
  await expect(
    page.getByRole('region', { name: firstQuestion }).getByText('First answer'),
  ).toHaveCount(0)
})

test('updating a question from the list stays on theory', async ({ page }) => {
  const questionText = `Update from ${Date.now()}`
  const updatedQuestionText = `Updated ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Original answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()

  const question = questionItem(page, questionText)

  await question.hover()
  await question.getByRole('button', { name: 'Update question' }).click()

  await expect(
    page.getByRole('heading', { name: 'Update question' }),
  ).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(updatedQuestionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Updated answer')
  await page.getByRole('button', { name: 'Update' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(isTheoryPath(page.url())).toBe(true)
  await expect(openedQuestion(page, updatedQuestionText)).toBeVisible()
  await expect(page.getByText('Updated answer')).toBeVisible()
  await expect(listQuestion(page, updatedQuestionText)).toBeVisible()
  await expect(listQuestion(page, questionText)).toHaveCount(0)
  await expect(notifications(page).getByText('Question updated.')).toBeVisible()
})

test('deleting a question from the list removes it', async ({ page }) => {
  const questionText = `Delete me ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Gone')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()

  const question = questionItem(page, questionText)

  await question.hover()
  await question.getByRole('button', { name: 'Delete question' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(listQuestion(page, questionText)).toHaveCount(0)
  await expect(openedQuestion(page, questionText)).toHaveCount(0)
  await expect(page).toHaveURL(/\/theory$/)
  await expect(notifications(page).getByText('Question deleted.')).toBeVisible()
})

test('a failed delete restores the question and shows a toast', async ({
  page,
}) => {
  const questionText = `Delete fail ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Stays')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })

  await failQuestionMutation(page, 'DELETE')

  const question = questionItem(page, questionText)

  await question.hover()
  await question.getByRole('button', { name: 'Delete question' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(
    notifications(page).getByText(
      'Could not delete the question. Try again later.',
    ),
  ).toBeVisible()
  await expect(questionItem(page, questionText)).toBeVisible()
  await expect(openedQuestion(page, questionText)).toBeVisible()
})

test('search filters questions by visible text', async ({ page }) => {
  const firstQuestion = `Search alpha ${Date.now()}`
  const secondQuestion = `Search beta ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, firstQuestion, 'Alpha answer')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(openedQuestion(page, firstQuestion)).toBeVisible({
    timeout: 15_000,
  })

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, secondQuestion, 'Beta answer')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(openedQuestion(page, secondQuestion)).toBeVisible({
    timeout: 15_000,
  })

  await listQuestion(page, secondQuestion).click()
  await expect(page).toHaveURL(/\/theory$/)

  const questionSearch = page.getByRole('searchbox', { name: 'search' })

  await questionSearch.click()
  await page.keyboard.type('alpha')
  await expect(questionSearch).toHaveValue('alpha')
  await expect(listQuestion(page, firstQuestion)).toBeVisible()
  await expect(listQuestion(page, secondQuestion)).toHaveCount(0)

  await questionSearch.fill('')
  await expect(listQuestion(page, firstQuestion)).toBeVisible()
  await expect(listQuestion(page, secondQuestion)).toBeVisible()
})

test('visiting theory with questions stays on theory', async ({ page }) => {
  const questionText = `Landing ${Date.now()}`

  await signIn(page)
  await openTheory(page)

  await headerCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillCreateQuestion(page, questionText, 'Landing answer')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page).toHaveURL(openedQuestionUrl, { timeout: 15_000 })

  await page.goto('/theory')
  await expect(page).toHaveURL(/\/theory$/)
  await expect(page.getByRole('heading', { name: 'Theory' })).toBeVisible()
  await expect(listQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show answer' })).toHaveCount(0)
})

test('questions belong only to the user who created them', async ({
  browser,
}) => {
  const ownerContext = await browser.newContext()
  const otherContext = await browser.newContext()
  const ownerPage = await ownerContext.newPage()
  const otherPage = await otherContext.newPage()

  try {
    const questionText = `Owner only ${Date.now()}`

    await signIn(ownerPage)
    await openTheory(ownerPage)

    await headerCreateQuestion(ownerPage).click()
    await expect(ownerPage.getByRole('dialog')).toBeVisible()
    await fillCreateQuestion(ownerPage, questionText, 'Private answer')
    await ownerPage.getByRole('button', { name: 'Create' }).click()

    await expect(ownerPage).toHaveURL(openedQuestionUrl, {
      timeout: 15_000,
    })

    const questionId = new URL(ownerPage.url()).searchParams.get('id')

    await signIn(otherPage)
    await openTheory(otherPage)

    await expect(otherPage).toHaveURL(/\/theory$/)
    await expect(otherPage.getByText('the questions list is empty')).toBeVisible()
    await expect(listQuestion(otherPage, questionText)).toHaveCount(0)

    await otherPage.goto(`/theory?id=${questionId}`)

    await expect(otherPage).toHaveURL(
      new RegExp(`/theory\\?id=${questionId}$`),
    )
    await expect(otherPage.getByText('question not found')).toBeVisible()
    await expect(openedQuestion(otherPage, questionText)).toHaveCount(0)
  } finally {
    await ownerContext.close()
    await otherContext.close()
  }
})
