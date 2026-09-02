import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { QuestionFields } from '@/features/questions/create-question'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  Spinner,
} from '@/shared/ui'

import {
  closeUpdateQuestionDialog,
  isUpdateQuestionDialogOpen,
  openUpdateQuestion,
  updateQuestionForm,
} from '../model/update-question'

export const UpdateQuestion = reatomComponent(() => {
  const isDialogOpen = isUpdateQuestionDialogOpen()
  const isQuestionReady = openUpdateQuestion.ready()
  const { fields, submit, validation } = updateQuestionForm
  const isSubmitReady = submit.ready()
  const hasValidationErrors = validation().errors.length > 0
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) {
      isUpdateQuestionDialogOpen.setTrue()

      return
    }

    closeUpdateQuestionDialog()
  })

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">
            Update question
          </DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Edit the question and its answer.
          </DialogDescription>
        </DialogHeader>
        {!isQuestionReady ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner className="size-6" />
            <span className="sr-only">loading</span>
          </div>
        ) : (
          <Form onSubmit={submit}>
            <QuestionFields question={fields.question} answer={fields.answer} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={wrap(closeUpdateQuestionDialog)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isSubmitReady || hasValidationErrors}
              >
                Update
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}, 'UpdateQuestion')
