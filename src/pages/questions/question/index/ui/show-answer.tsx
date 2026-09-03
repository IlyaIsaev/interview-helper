import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { Markdown } from '@/shared/ui'

import { isAnswerVisible, showAnswer } from '../model/show-answer'
import { QuestionActionButton } from './question-action-button'

type ShowAnswerProps = {
  answer: string
}

export const ShowAnswer = reatomComponent(({ answer }: ShowAnswerProps) => {
  if (!isAnswerVisible()) {
    const handleShowAnswer = wrap(showAnswer)

    return (
      <QuestionActionButton onClick={handleShowAnswer}>Show answer</QuestionActionButton>
    )
  }

  return (
    <div className="mt-[3lh] min-h-0 flex-1 overflow-y-auto">
      <Markdown>{answer}</Markdown>
    </div>
  )
}, 'ShowAnswer')
