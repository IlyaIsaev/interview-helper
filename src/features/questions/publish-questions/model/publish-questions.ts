import { action, reatomBoolean, withAsync, wrap } from "@reatom/core";

import { clientApi } from "@/shared/api";
import { isSignedIn } from "@/shared/auth";
import { toast } from "@/shared/ui";

export const isPublishQuestionsDialogOpen = reatomBoolean(false, "isPublishQuestionsDialogOpen");

export const closePublishQuestionsDialog = action(() => {
  isPublishQuestionsDialogOpen.setFalse();
}, "closePublishQuestionsDialog");

export const openPublishQuestions = action(() => {
  isPublishQuestionsDialogOpen.setTrue();
}, "openPublishQuestions");

export const publishQuestions = action(async () => {
  if (!isSignedIn()) return;

  closePublishQuestionsDialog();

  try {
    await wrap(clientApi.publishQuestions());
  } catch {
    toast.error("Could not publish the questions. Try again later.");

    return;
  }

  toast.success("Published.");
}, "publishQuestions").extend(withAsync());
