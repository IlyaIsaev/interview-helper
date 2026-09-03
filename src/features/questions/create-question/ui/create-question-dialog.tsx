import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormMessage,
} from '@/shared/ui'

import {
  closeCreateQuestionDialog,
  createQuestionForm,
  isCreateQuestionDialogOpen,
} from '../model/create-question'
import { QuestionFields } from './question-fields'

export const CreateQuestion = reatomComponent(() => {
  const isDialogOpen = isCreateQuestionDialogOpen()
  const { fields, submit, validation } = createQuestionForm
  const isSubmitReady = submit.ready()
  const hasValidationErrors = validation().errors.length > 0
  const submitError = submit.error()
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) {
      isCreateQuestionDialogOpen.setTrue()

      return
    }

    closeCreateQuestionDialog()
  })

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] min-h-0 min-w-[min(40vw,calc(100%-2rem))] w-[min(90vw,calc(100%-2rem))] flex-col overflow-clip [overflow-clip-margin:6px] sm:max-w-[90vw]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">
            Create question
          </DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Add a question and its answer.
          </DialogDescription>
        </DialogHeader>
        <Form
          className="min-h-0 flex-1 overflow-clip [overflow-clip-margin:6px]"
          onSubmit={submit}
        >
          <QuestionFields question={fields.question} answer={fields.answer} />
          <FormMessage>{submitError?.message}</FormMessage>
          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={wrap(closeCreateQuestionDialog)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isSubmitReady || hasValidationErrors}
            >
              Create
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}, 'CreateQuestion')
