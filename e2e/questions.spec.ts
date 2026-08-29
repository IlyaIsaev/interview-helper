import { expect, test, type Page } from '@playwright/test'

const signedInPath = /\/questions(\/[0-9a-f-]+)?$/

const isQuestionsListPath = (url: string) =>
  new URL(url).pathname === '/questions'

const revealAnswer = async (page: Page, answer: string) => {
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible()
  await expect(page.getByText(answer)).toHaveCount(0)
  await page.getByRole('button', { name: 'Show answer' }).click()
  await expect(page.getByText(answer)).toBeVisible()
}

const sidebarCreateQuestion = (page: Page) =>
  page
    .getByRole('button', { name: 'Create question' })
    .filter({ has: page.locator('svg') })

const emptyCreateQuestion = (page: Page) =>
  page
    .getByRole('button', { name: 'Create question' })
    .filter({ hasText: 'Create question' })

const signIn = async (page: Page) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled()
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(signedInPath, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
}

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

test('signed-in users land on questions and can open a missing question', async ({
  page,
}) => {
  await signIn(page)

  if (isQuestionsListPath(page.url())) {
    await expect(page.getByText('the questions list is empty')).toBeVisible()
    await expect(emptyCreateQuestion(page)).toBeVisible()
  }

  await page.goto('/questions/abc')

  await expect(page).toHaveURL(/\/questions\/abc$/)
  await expect(page.getByText('question not found')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Questions' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()

  await page.goto('/')

  await expect(page).toHaveURL(signedInPath)
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
})

test('sidebar plus and empty-state button open the create question form', async ({
  page,
}) => {
  await signIn(page)

  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Create question' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  if (isQuestionsListPath(page.url())) {
    await emptyCreateQuestion(page).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Create question' }),
    ).toBeVisible()
  }
})

test('creating a question from the sidebar goes to the new question page', async ({
  page,
}) => {
  const questionText = `What is FSD? ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Feature-Sliced Design')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: questionText })).toBeVisible()
  await revealAnswer(page, 'Feature-Sliced Design')
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('updating a question from the sidebar goes to the question page', async ({
  page,
}) => {
  const questionText = `Update from ${Date.now()}`
  const updatedQuestionText = `Updated ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Original answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: questionText })).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  const questionItem = page
    .getByRole('listitem')
    .filter({ hasText: questionText })

  await questionItem.hover()
  await questionItem.getByRole('button', { name: 'Update question' }).click()

  await expect(
    page.getByRole('heading', { name: 'Update question' }),
  ).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'question' })).toHaveValue(
    questionText,
  )
  await expect(page.getByRole('textbox', { name: 'answer' })).toHaveValue(
    'Original answer',
  )

  await page.getByRole('textbox', { name: 'question' }).fill(updatedQuestionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Updated answer')
  await page.getByRole('button', { name: 'Update' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: updatedQuestionText }),
  ).toBeVisible()
  await revealAnswer(page, 'Updated answer')
  await expect(
    page.getByRole('link', { name: updatedQuestionText }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('mobile sidebar sheet shows Questions and opens create form', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signIn(page)

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

test('app title and sidebar question links navigate without losing the sidebar', async ({
  page,
}) => {
  const questionText = `Title nav ${Date.now()}`

  await signIn(page)

  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Feature-Sliced Design')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: questionText })).toBeVisible()
  await revealAnswer(page, 'Feature-Sliced Design')

  await page.reload()

  await expect(page.getByRole('heading', { name: questionText })).toBeVisible({
    timeout: 15_000,
  })
  await revealAnswer(page, 'Feature-Sliced Design')
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()

  await page.getByRole('link', { name: 'Interview helper' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()

  await page.getByRole('link', { name: questionText }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)
  await expect(page.getByRole('heading', { name: questionText })).toBeVisible()
  await revealAnswer(page, 'Feature-Sliced Design')
  await expect(page.getByRole('heading', { name: 'Home' })).toHaveCount(0)
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()
})

test('list and auth routes send signed-in users with questions to a question page', async ({
  page,
}) => {
  const questionText = `Landing ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Landing answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })

  await page.goto('/questions')
  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)

  await page.goto('/')
  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)

  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0)
})

test('sidebar stays visible while a child page chunk is loading', async ({
  page,
}) => {
  await signIn(page)

  await page.route('**/src/pages/home/questions/question/**', async (route) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    await route.continue()
  })

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill('Suspense nav')
  await page.getByRole('textbox', { name: 'answer' }).fill('Keep the sidebar')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByRole('heading', { name: 'Suspense nav' })).toHaveCount(
    0,
    {
      timeout: 500,
    },
  )
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Suspense nav' })).toBeVisible({
    timeout: 15_000,
  })
  await revealAnswer(page, 'Keep the sidebar')
  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()
})
