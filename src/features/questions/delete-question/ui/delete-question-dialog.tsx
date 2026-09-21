import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";

import { isSignedIn } from "@/shared/auth";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DisabledButtonTooltip,
} from "@/shared/ui";

import {
  closeDeleteQuestionDialog,
  deleteQuestion,
  isDeleteQuestionDialogOpen,
} from "../model/delete-question";

export const DeleteQuestion = reatomComponent(() => {
  const isDialogOpen = isDeleteQuestionDialogOpen();
  const isDeleteReady = deleteQuestion.ready();
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) isDeleteQuestionDialogOpen.setTrue();

    if (!shouldOpen) closeDeleteQuestionDialog();
  });
  const handleDeleteQuestion = wrap(deleteQuestion);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">Delete question</DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={wrap(closeDeleteQuestionDialog)}>
            Cancel
          </Button>
          {isSignedIn() ? (
            <Button
              type="button"
              variant="destructive"
              disabled={!isDeleteReady}
              onClick={handleDeleteQuestion}
            >
              Delete
            </Button>
          ) : (
            <DisabledButtonTooltip tooltip="Sign in to delete a question">
              <Button type="button" variant="destructive" disabled>
                Delete
              </Button>
            </DisabledButtonTooltip>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}, "DeleteQuestion");
