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
  Textarea,
} from '@/shared/ui'

import {
  closeCreateQuestionDialog,
  createQuestionForm,
  isCreateQuestionDialogOpen,
} from '../model/create-question'
import { MarkdownPreview } from './markdown-preview'

export const CreateQuestion = reatomComponent(() => {
  const isDialogOpen = isCreateQuestionDialogOpen()
  const { fields, submit, validation } = createQuestionForm
  const isSubmitReady = submit.ready()
  const hasValidationErrors = validation().errors.length > 0
  const submitError = submit.error()
  const questionField = bindFormControl(fields.question)
  const answerField = bindFormControl(fields.answer)
  const questionValue = fields.question()
  const answerValue = fields.answer()
  const handleDialogOpenChange = wrap((isOpen: boolean) => {
    if (isOpen) {
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
          <FormField field={fields.question}>
            <FormItem>
              <FormLabel>question</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <FormControl>
                  <Textarea className="min-h-32" {...questionField} />
                </FormControl>
                <MarkdownPreview>{questionValue}</MarkdownPreview>
              </div>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField field={fields.answer}>
            <FormItem>
              <FormLabel>answer</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <FormControl>
                  <Textarea className="min-h-32" {...answerField} />
                </FormControl>
                <MarkdownPreview>{answerValue}</MarkdownPreview>
              </div>
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
