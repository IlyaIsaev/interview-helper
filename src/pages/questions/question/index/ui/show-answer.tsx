import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { Button } from '@/shared/ui'

import { isAnswerVisible, showAnswer } from '../model/show-answer'

type ShowAnswerProps = {
  answer: string
}

export const ShowAnswer = reatomComponent(({ answer }: ShowAnswerProps) => {
  if (!isAnswerVisible()) {
    const handleShowAnswer = wrap(showAnswer)

    return (
      <Button type="button" onClick={handleShowAnswer}>
        Show answer
      </Button>
    )
  }

  return (
    <>
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        answer
      </p>
      <p className="text-ui text-muted-foreground">{answer}</p>
    </>
  )
}, 'ShowAnswer')
