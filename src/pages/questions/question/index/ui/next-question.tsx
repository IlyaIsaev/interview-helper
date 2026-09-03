import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { Button } from '@/shared/ui'

import { openNextQuestion, otherQuestions } from '../model/next-question'
import { isAnswerVisible } from '../model/show-answer'

export const NextQuestion = reatomComponent(() => {
  if (!isAnswerVisible() || otherQuestions().length === 0) {
    return null
  }

  const handleOpenNextQuestion = wrap(openNextQuestion)

  return (
    <Button className="mt-auto shrink-0" type="button" onClick={handleOpenNextQuestion}>
      Next question
    </Button>
  )
}, 'NextQuestion')
