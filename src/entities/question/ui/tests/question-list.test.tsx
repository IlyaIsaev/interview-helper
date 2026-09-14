import { expect, test } from 'vitest'
import { userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'

import { SidebarProvider } from '@/shared/ui'

import type { Question } from '../../model/questions'
import { QuestionList } from '../question-list'

const firstQuestion = {
  id: '11111111-1111-1111-1111-111111111111',
  question: 'First question',
}

const secondQuestion = {
  id: '22222222-2222-2222-2222-222222222222',
  question: 'Second question',
}

type RenderQuestionListOptions = {
  onQuestionClick?: (questionId: string) => void
}

async function renderQuestionList({
  onQuestionClick = () => {},
}: RenderQuestionListOptions = {}) {
  function renderUpdateQuestion(question: Question) {
    return <span>{`update ${question.id}`}</span>
  }

  function renderDeleteQuestion(question: Question) {
    return <span>{`delete ${question.id}`}</span>
  }

  return render(
    <SidebarProvider className="h-[400px]">
      <QuestionList
        questions={[firstQuestion, secondQuestion]}
        activeQuestionId={firstQuestion.id}
        activeAriaCurrent="page"
        onQuestionClick={onQuestionClick}
        updateQuestion={renderUpdateQuestion}
        deleteQuestion={renderDeleteQuestion}
      />
    </SidebarProvider>,
  )
}

test('should show update and delete slots when the questions list renders', async () => {
  const screen = await renderQuestionList()

  await expect.element(screen.getByRole('button', { name: 'First question' })).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Second question' })).toBeVisible()
  await expect.element(screen.getByText(`update ${firstQuestion.id}`)).toBeVisible()
  await expect.element(screen.getByText(`delete ${firstQuestion.id}`)).toBeVisible()
})

test('should call onQuestionClick when a question row is clicked', async () => {
  const clicks: Array<string> = []
  const screen = await renderQuestionList({
    onQuestionClick: (questionId) => {
      clicks.push(questionId)
    },
  })

  await userEvent.click(screen.getByRole('button', { name: 'Second question' }))

  expect(clicks).toEqual([secondQuestion.id])
})
