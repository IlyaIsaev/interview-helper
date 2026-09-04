import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { cn } from '@/shared/lib'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Markdown,
  Spinner,
} from '@/shared/ui'

import {
  closeQuestionPreview,
  isQuestionPreviewOpen,
  openQuestionPreview,
  previewedQuestion,
} from '../model/question-preview'

const questionPreviewClassName = cn(
  'mx-auto flex h-full min-h-0 w-full max-w-[80ch] flex-1 flex-col gap-4 px-4 py-4',
)

const questionAnswerColumnClassName = cn('flex min-h-0 flex-1 flex-col')

export const QuestionPreview = reatomComponent(() => {
  const isDialogOpen = isQuestionPreviewOpen()
  const isQuestionReady = openQuestionPreview.ready()
  const question = previewedQuestion()
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) {
      isQuestionPreviewOpen.setTrue()

      return
    }

    closeQuestionPreview()
  })

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] min-h-0 min-w-[min(40vw,calc(100%-2rem))] w-[min(90vw,calc(100%-2rem))] flex-col overflow-clip [overflow-clip-margin:6px] sm:max-w-[90vw]">
        <DialogHeader className="sr-only">
          <DialogTitle>Question</DialogTitle>
          <DialogDescription>Question and answer.</DialogDescription>
        </DialogHeader>
        {!isQuestionReady || !question ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Spinner className="size-6" />
            <span className="sr-only">loading</span>
          </div>
        ) : (
          <section className={questionPreviewClassName}>
            <div className={questionAnswerColumnClassName}>
              <Markdown className="shrink-0">{question.question}</Markdown>
              <div className="h-[3lh] shrink-0" aria-hidden="true" />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <Markdown>{question.answer}</Markdown>
              </div>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  )
}, 'QuestionPreview')
