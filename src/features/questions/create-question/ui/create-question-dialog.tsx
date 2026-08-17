import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import {
  bindFormControl,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/shared/ui'

import {
  closeCreateQuestionDialog,
  createQuestionForm,
  isCreateQuestionDialogOpen,
} from '../model/create-question'

export const CreateQuestion = reatomComponent(() => {
  const isDialogOpen = isCreateQuestionDialogOpen()
  const { fields, submit, validation } = createQuestionForm
  const isSubmitReady = submit.ready()
  const hasValidationErrors = validation().errors.length > 0
  const submitError = submit.error()
  const questionField = bindFormControl(fields.question)
  const answerField = bindFormControl(fields.answer)
  const handleDialogOpenChange = wrap((isOpen: boolean) => {
    if (isOpen) {
      isCreateQuestionDialogOpen.setTrue()

      return
    }

    closeCreateQuestionDialog()
  })

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">
            Create question
          </DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Add a question and its answer.
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={submit}>
          <FormField field={fields.question}>
            <FormItem>
              <FormLabel>question</FormLabel>
              <FormControl>
                <Input {...questionField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField field={fields.answer}>
            <FormItem>
              <FormLabel>answer</FormLabel>
              <FormControl>
                <Textarea {...answerField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
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
