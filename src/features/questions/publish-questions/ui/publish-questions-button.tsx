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
  Spinner,
} from "@/shared/ui";

import {
  closePublishQuestionsDialog,
  isPublishQuestionsDialogOpen,
  openPublishQuestions,
  publishQuestions,
} from "../model/publish-questions";

export const PublishQuestionsButton = reatomComponent(() => {
  if (!isSignedIn()) return null;

  const isDialogOpen = isPublishQuestionsDialogOpen();
  const isPublishReady = publishQuestions.ready();
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) isPublishQuestionsDialogOpen.setTrue();

    if (!shouldOpen) closePublishQuestionsDialog();
  });
  const handleOpenPublishQuestions = wrap(openPublishQuestions);
  const handlePublishQuestions = wrap(publishQuestions);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        disabled={!isPublishReady}
        onClick={handleOpenPublishQuestions}
      >
        {!isPublishReady ? <Spinner data-icon="inline-start" /> : null}
        {isPublishReady ? "Publish" : "Publishing..."}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xs uppercase tracking-[1.5px]">
              Publish questions
            </DialogTitle>
            <DialogDescription className="text-ui text-muted-foreground">
              This completely replaces the previously published catalog. Guests will see only your
              current questions. Later edits stay private until you publish again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={wrap(closePublishQuestionsDialog)}>
              Cancel
            </Button>
            <Button type="button" disabled={!isPublishReady} onClick={handlePublishQuestions}>
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}, "PublishQuestionsButton");
