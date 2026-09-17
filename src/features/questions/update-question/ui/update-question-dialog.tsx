import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { FileUp } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';

import { QuestionFields } from '@/entities/questions/question';
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
} from '@/shared/ui';

import {
  closeUpdateQuestionDialog,
  importQuestionFromMarkdown,
  isUpdateQuestionDialogOpen,
  openUpdateQuestion,
  updateQuestionForm,
} from '../model/update-question';

export const UpdateQuestion = reatomComponent(() => {
  const markdownFileInputRef = useRef<HTMLInputElement>(null);
  const isDialogOpen = isUpdateQuestionDialogOpen();
  const isQuestionReady = openUpdateQuestion.ready();
  const { fields, submit, validation } = updateQuestionForm;
  const isSubmitReady = submit.ready();
  const hasValidationErrors = validation().errors.length > 0;
  const { dirty } = updateQuestionForm.focus();
  const openMarkdownFilePicker = wrap(() => {
    markdownFileInputRef.current?.click();
  });
  const handleMarkdownFileChange = wrap(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      await importQuestionFromMarkdown(file);

      event.target.value = '';
    },
  );
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) isUpdateQuestionDialogOpen.setTrue();

    if (!shouldOpen) closeUpdateQuestionDialog();
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] min-h-0 min-w-[min(40vw,calc(100%-2rem))] w-[min(90vw,calc(100%-2rem))] flex-col overflow-clip [overflow-clip-margin:6px] sm:max-w-[90vw]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">
            Update question
          </DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Edit the question and its answer.
          </DialogDescription>
        </DialogHeader>
        {!isQuestionReady ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Spinner className="size-6" />
            <span className="sr-only">loading</span>
          </div>
        ) : (
          <Form
            className="min-h-0 flex-1 overflow-clip [overflow-clip-margin:6px]"
            onSubmit={submit}
          >
            <QuestionFields question={fields.question} answer={fields.answer} />
            <input
              ref={markdownFileInputRef}
              type="file"
              accept=".md"
              className="hidden"
              onChange={handleMarkdownFileChange}
            />
            <DialogFooter className="shrink-0 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={openMarkdownFilePicker}
              >
                <FileUp data-icon="inline-start" />
                From markdown
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={wrap(closeUpdateQuestionDialog)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isSubmitReady || hasValidationErrors || !dirty}
                >
                  Update
                </Button>
              </div>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}, 'UpdateQuestion');
