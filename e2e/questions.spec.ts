import { expect, test, type Page } from '@playwright/test'

const signedInPath = /\/questions(\/[0-9a-f-]+)?$/

const isQuestionsListPath = (url: string) =>
  new URL(url).pathname === '/questions'

const revealAnswer = async (page: Page, answer: string) => {
  const showAnswer = page.getByRole('button', { name: 'Show answer' })

  await expect(showAnswer).toBeVisible()
  await expect(showAnswer).toBeFocused()
  await expect(page.getByText(answer)).toHaveCount(0)
  await page.keyboard.press('Enter')
  await expect(page.getByText(answer)).toBeVisible()
}

const openedQuestion = (page: Page, questionText: string) =>
  page.getByRole('main').getByText(questionText, { exact: true })

const sidebarCreateQuestion = (page: Page) =>
  page
    .getByRole('button', { name: 'Create question' })
    .filter({ has: page.locator('svg') })

const emptyCreateQuestion = (page: Page) =>
  page
    .getByRole('button', { name: 'Create question' })
    .filter({ hasText: 'Create question' })

const signIn = async (page: Page) => {
  await page.goto('/sign-up')

  await expect(page.getByLabel('email')).toHaveValue(
    /demo-user-[a-f0-9]{8}@demo\.com/,
  )
  await expect(page.getByRole('button', { name: 'Create account' })).toBeEnabled()
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(signedInPath, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Demo user' })).toBeVisible()
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

const holdQuestionGet = async (page: Page) => {
  let releaseLoad = () => {}
  const loadHeld = new Promise<void>((resolve) => {
    releaseLoad = resolve
  })

  await page.route('**/api/questions/*', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()

      return
    }

    await loadHeld
    await route.continue()
  })

  return () => {
    releaseLoad()
  }
}

const notifications = (page: Page) =>
  page.getByRole('region', { name: /Notifications/i })

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
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled()

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
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Feature-Sliced Design')
  await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled()
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await revealAnswer(page, 'Feature-Sliced Design')
  await expect(page.getByRole('button', { name: 'Next question' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(
    page.getByRole('link', { name: questionText, current: 'page' }),
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
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

    await sidebarCreateQuestion(ownerPage).click()
    await expect(ownerPage.getByRole('dialog')).toBeVisible()
    await ownerPage.getByRole('textbox', { name: 'question' }).fill(questionText)
    await ownerPage.getByRole('textbox', { name: 'answer' }).fill('Private answer')
    await ownerPage.getByRole('button', { name: 'Create' }).click()

    await expect(ownerPage).toHaveURL(/\/questions\/[0-9a-f-]+$/, {
      timeout: 15_000,
    })
    await expect(
      openedQuestion(ownerPage, questionText),
    ).toBeVisible()

    const questionId = new URL(ownerPage.url()).pathname.split('/').at(-1)
    const otherQuestionText = `Other user ${Date.now()}`

    await signIn(otherPage)

    await expect(otherPage).toHaveURL(/\/questions$/)
    await expect(otherPage.getByText('the questions list is empty')).toBeVisible()
    await expect(otherPage.getByRole('link', { name: questionText })).toHaveCount(0)

    await sidebarCreateQuestion(otherPage).click()
    await expect(otherPage.getByRole('dialog')).toBeVisible()
    await otherPage
      .getByRole('textbox', { name: 'question' })
      .fill(otherQuestionText)
    await otherPage.getByRole('textbox', { name: 'answer' }).fill('Other answer')
    await otherPage.getByRole('button', { name: 'Create' }).click()

    await expect(otherPage).toHaveURL(/\/questions\/[0-9a-f-]+$/, {
      timeout: 15_000,
    })
    await expect(
      openedQuestion(otherPage, otherQuestionText),
    ).toBeVisible()
    await expect(otherPage.getByRole('link', { name: questionText })).toHaveCount(0)

    await otherPage.goto(`/questions/${questionId}`)

    await expect(otherPage).toHaveURL(new RegExp(`/questions/${questionId}$`))
    await expect(otherPage.getByText('question not found')).toBeVisible()
    await expect(
      openedQuestion(otherPage, questionText),
    ).toHaveCount(0)
  } finally {
    await ownerContext.close()
    await otherContext.close()
  }
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
  await expect(openedQuestion(page, questionText)).toBeVisible()
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
  await expect(page.getByRole('button', { name: 'Update' })).toBeDisabled()

  await page.getByRole('textbox', { name: 'question' }).fill(updatedQuestionText)
  await expect(page.getByRole('button', { name: 'Update' })).toBeEnabled()
  await page.getByRole('textbox', { name: 'answer' }).fill('Updated answer')
  await page.getByRole('button', { name: 'Update' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(
    openedQuestion(page, updatedQuestionText),
  ).toBeVisible()
  await revealAnswer(page, 'Updated answer')
  await expect(
    page.getByRole('link', { name: updatedQuestionText }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(notifications(page).getByText('Question updated.')).toBeVisible()
  await expect(notifications(page).getByText(questionText)).toBeVisible()
})

test('updating a question shows a spinner while the question loads', async ({
  page,
}) => {
  const questionText = `Update spinner ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Original answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  const releaseQuestionGet = await holdQuestionGet(page)
  const questionItem = page
    .getByRole('listitem')
    .filter({ hasText: questionText })
  const updateDialog = page.getByRole('dialog')

  await questionItem.hover()
  await questionItem.getByRole('button', { name: 'Update question' }).click()

  await expect(
    updateDialog.getByRole('heading', { name: 'Update question' }),
  ).toBeVisible()
  await expect(
    updateDialog.getByRole('status', { name: 'Loading' }),
  ).toBeVisible()
  await expect(updateDialog.getByRole('textbox', { name: 'question' })).toHaveCount(
    0,
  )

  releaseQuestionGet()

  await expect(updateDialog.getByRole('textbox', { name: 'question' })).toHaveValue(
    questionText,
  )
  await expect(updateDialog.getByRole('textbox', { name: 'answer' })).toHaveValue(
    'Original answer',
  )
  await expect(
    updateDialog.getByRole('status', { name: 'Loading' }),
  ).toHaveCount(0)
})

test('deleting a question from the sidebar removes it', async ({ page }) => {
  const questionText = `Delete me ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Gone')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  const questionItem = page
    .getByRole('listitem')
    .filter({ hasText: questionText })

  await questionItem.hover()
  await questionItem.getByRole('button', { name: 'Delete question' }).click()

  await expect(
    page.getByRole('heading', { name: 'Delete question' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(openedQuestion(page, questionText)).toBeVisible()

  await questionItem.hover()
  await questionItem.getByRole('button', { name: 'Delete question' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page.getByRole('link', { name: questionText })).toHaveCount(0)
  await expect(openedQuestion(page, questionText)).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(signedInPath)
  await expect(notifications(page).getByText('Question deleted.')).toBeVisible()
  await expect(notifications(page).getByText(questionText)).toBeVisible()
})

test('a failed delete restores the question and shows a toast', async ({
  page,
}) => {
  const questionText = `Delete fail ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Stays')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()

  await failQuestionMutation(page, 'DELETE')

  const questionItem = page
    .getByRole('listitem')
    .filter({ hasText: questionText })

  await questionItem.hover()
  await questionItem.getByRole('button', { name: 'Delete question' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    notifications(page).getByText(
      'Could not delete the question. Try again later.',
    ),
  ).toBeVisible()
  await expect(notifications(page).getByText(questionText)).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(openedQuestion(page, questionText)).toBeVisible()
})

test('a failed update restores the question and shows a toast', async ({
  page,
}) => {
  const questionText = `Update fail ${Date.now()}`
  const updatedQuestionText = `Updated fail ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Original answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()

  await failQuestionMutation(page, 'PUT')

  const questionItem = page
    .getByRole('listitem')
    .filter({ hasText: questionText })

  await questionItem.hover()
  await questionItem.getByRole('button', { name: 'Update question' }).click()

  await expect(
    page.getByRole('heading', { name: 'Update question' }),
  ).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(updatedQuestionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Updated answer')
  await page.getByRole('button', { name: 'Update' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    notifications(page).getByText(
      'Could not update the question. Try again later.',
    ),
  ).toBeVisible()
  await expect(notifications(page).getByText(questionText)).toBeVisible()
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(page.getByRole('link', { name: updatedQuestionText })).toHaveCount(
    0,
  )
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
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await revealAnswer(page, 'Feature-Sliced Design')

  await page.reload()

  await expect(openedQuestion(page, questionText)).toBeVisible({
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
  await expect(openedQuestion(page, questionText)).toBeVisible()
  await expect(
    page.getByRole('link', { name: questionText, current: 'page' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Home' })).toHaveCount(0)
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()
})

test('reloading a question page fetches that question once', async ({
  page,
}) => {
  const questionText = `Reload once ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(questionText)
  await page.getByRole('textbox', { name: 'answer' }).fill('Once on reload')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/, { timeout: 15_000 })
  await expect(openedQuestion(page, questionText)).toBeVisible()

  const questionId = new URL(page.url()).pathname.split('/').at(-1)
  const questionRequests: string[] = []

  page.on('request', (request) => {
    if (request.method() !== 'GET') {

      return
    }

    if (new URL(request.url()).pathname === `/api/questions/${questionId}`) {
      questionRequests.push(request.url())
    }
  })

  await page.reload()

  await expect(openedQuestion(page, questionText)).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('link', { name: questionText })).toBeVisible()
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()
  expect(questionRequests).toHaveLength(1)
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

  await page.route('**/src/pages/questions/question/**', async (route) => {
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

  await expect(openedQuestion(page, 'Suspense nav')).toHaveCount(
    0,
    {
      timeout: 500,
    },
  )
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()

  await expect(openedQuestion(page, 'Suspense nav')).toBeVisible({
    timeout: 15_000,
  })
  await revealAnswer(page, 'Keep the sidebar')
  await expect(page).toHaveURL(/\/questions\/[0-9a-f-]+$/)
  await expect(page.getByText('Questions', { exact: true }).first()).toBeVisible()
  await expect(sidebarCreateQuestion(page)).toBeVisible()
})

test('next question opens another loaded question', async ({ page }) => {
  const firstQuestion = `Next first ${Date.now()}`
  const secondQuestion = `Next second ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(firstQuestion)
  await page.getByRole('textbox', { name: 'answer' }).fill('First answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(openedQuestion(page, firstQuestion)).toBeVisible({
    timeout: 15_000,
  })

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(secondQuestion)
  await page.getByRole('textbox', { name: 'answer' }).fill('Second answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(openedQuestion(page, secondQuestion)).toBeVisible({
    timeout: 15_000,
  })

  await revealAnswer(page, 'Second answer')
  const nextQuestion = page.getByRole('button', { name: 'Next question' })

  await expect(nextQuestion).toBeVisible()
  await expect(nextQuestion).toBeFocused()

  const openedQuestionUrl = page.url()

  await page.keyboard.press('Enter')

  await expect(page).not.toHaveURL(openedQuestionUrl)
  await expect(openedQuestion(page, firstQuestion)).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeFocused()
  await expect(page.getByText('Second answer')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Next question' })).toHaveCount(0)
})

test('sidebar search filters questions by visible text', async ({ page }) => {
  const firstQuestion = `Search alpha ${Date.now()}`
  const secondQuestion = `Search beta ${Date.now()}`

  await signIn(page)

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(firstQuestion)
  await page.getByRole('textbox', { name: 'answer' }).fill('Alpha answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(openedQuestion(page, firstQuestion)).toBeVisible({
    timeout: 15_000,
  })

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(secondQuestion)
  await page.getByRole('textbox', { name: 'answer' }).fill('Beta answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(openedQuestion(page, secondQuestion)).toBeVisible({
    timeout: 15_000,
  })

  const questionSearch = page.getByRole('searchbox', { name: 'search' })

  await questionSearch.click()
  await page.keyboard.type('alpha')
  await expect(questionSearch).toHaveValue('alpha')
  await expect(questionSearch).toBeFocused()
  await expect(page.getByRole('link', { name: firstQuestion })).toBeVisible()
  await expect(page.getByRole('link', { name: secondQuestion })).toHaveCount(0)

  await questionSearch.fill('')
  await expect(page.getByRole('link', { name: firstQuestion })).toBeVisible()
  await expect(page.getByRole('link', { name: secondQuestion })).toBeVisible()

  const gammaStamp = Date.now()
  const gammaQuestion = `# Search gamma ${gammaStamp}`
  const gammaVisible = `Search gamma ${gammaStamp}`

  await sidebarCreateQuestion(page).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'question' }).fill(gammaQuestion)
  await page.getByRole('textbox', { name: 'answer' }).fill('Gamma answer')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByRole('heading', { name: gammaVisible })).toBeVisible({
    timeout: 15_000,
  })

  await questionSearch.fill('gamma')
  await expect(page.getByRole('link', { name: gammaVisible })).toBeVisible()
  await expect(page.getByRole('link', { name: firstQuestion })).toHaveCount(0)

  await questionSearch.fill('#')
  await expect(page.getByRole('link', { name: gammaVisible })).toHaveCount(0)
  await expect(page.getByText('no matches')).toBeVisible()

  await questionSearch.fill('')
  await expect(page.getByRole('link', { name: firstQuestion })).toBeVisible()
  await expect(page.getByRole('link', { name: secondQuestion })).toBeVisible()
  await expect(page.getByRole('link', { name: gammaVisible })).toBeVisible()
})
