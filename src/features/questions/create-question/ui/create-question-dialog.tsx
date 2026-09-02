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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">
            Create question
          </DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Add a question and its answer.
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={submit}>
          <QuestionFields question={fields.question} answer={fields.answer} />
          <FormMessage>{submitError?.message}</FormMessage>
          <DialogFooter>
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
