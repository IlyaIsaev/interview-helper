import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { openNextQuestion, otherQuestions } from '../model/next-question'
import { isAnswerVisible } from '../model/show-answer'
import { QuestionActionButton } from './question-action-button'

export const NextQuestion = reatomComponent(() => {
  if (!isAnswerVisible() || otherQuestions().length === 0) {
    return null
  }

  const handleOpenNextQuestion = wrap(openNextQuestion)

  return (
    <QuestionActionButton onClick={handleOpenNextQuestion}>
      Next question
    </QuestionActionButton>
  )
}, 'NextQuestion')
