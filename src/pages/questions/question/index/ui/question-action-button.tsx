import { useLayoutEffect, useRef, type ReactNode } from 'react'

import { Button } from '@/shared/ui'

type QuestionActionButtonProps = {
  children: ReactNode
  onClick: () => void
}

export function QuestionActionButton({
  children,
  onClick,
}: QuestionActionButtonProps) {
  const questionAction = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    const button = questionAction.current

    if (!button) {
      return
    }

    const focusQuestionAction = () => {
      if (document.querySelector('[role="dialog"]')) {
        return
      }

      button.focus()
    }

    focusQuestionAction()

    let dialogCount = document.querySelectorAll('[role="dialog"]').length
    let dialogCloseFrame = 0
    const observer = new MutationObserver(() => {
      const nextDialogCount = document.querySelectorAll('[role="dialog"]').length

      if (dialogCount > 0 && nextDialogCount === 0) {
        focusQuestionAction()
        dialogCloseFrame = requestAnimationFrame(() => {
          focusQuestionAction()
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
      ref={questionAction}
      className="mt-auto shrink-0"
      type="button"
      autoFocus
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
