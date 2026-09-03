import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { useLayoutEffect, useRef } from 'react'

import { Button, Card, CardContent, Markdown } from '@/shared/ui'

import { isAnswerVisible, showAnswer } from '../model/show-answer'

type ShowAnswerProps = {
  answer: string
}

type ShowAnswerButtonProps = {
  onShowAnswer: () => void
}

function ShowAnswerButton({ onShowAnswer }: ShowAnswerButtonProps) {
  const showAnswerButton = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const button = showAnswerButton.current

    if (!button) {
      return
    }

    const focusShowAnswer = () => {
      if (document.querySelector('[role="dialog"]')) {
        return
      }

      button.focus()
    }

    focusShowAnswer()

    let dialogCount = document.querySelectorAll('[role="dialog"]').length
    let dialogCloseFrame = 0
    const observer = new MutationObserver(() => {
      const nextDialogCount = document.querySelectorAll('[role="dialog"]').length

      if (dialogCount > 0 && nextDialogCount === 0) {
        focusShowAnswer()
        dialogCloseFrame = requestAnimationFrame(() => {
          focusShowAnswer()
        })
      }

      dialogCount = nextDialogCount
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(dialogCloseFrame)
      observer.disconnect()
    }
  }, [])

  return (
    <Button
      ref={showAnswerButton}
      className="mt-auto shrink-0"
      type="button"
      autoFocus
      onClick={onShowAnswer}
    >
      Show answer
    </Button>
  )
}

export const ShowAnswer = reatomComponent(({ answer }: ShowAnswerProps) => {
  if (!isAnswerVisible()) {
    const handleShowAnswer = wrap(showAnswer)

    return <ShowAnswerButton onShowAnswer={handleShowAnswer} />
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Card>
        <CardContent className="pt-3.5">
          <Markdown>{answer}</Markdown>
        </CardContent>
      </Card>
    </div>
  )
}, 'ShowAnswer')
