import { action, atom, withAsync, wrap } from "@reatom/core";

import { clientApi } from "@/shared/api";
import { isSignedIn } from "@/shared/auth";
import { toast } from "@/shared/ui";

export const publishingQuestionId = atom<string | null>(null, "publishingQuestionId");

export const publishQuestion = action(async (questionId: string) => {
  if (!isSignedIn()) return;

  publishingQuestionId.set(questionId);

  try {
    await wrap(clientApi.publishQuestion(questionId));

    toast.success("Published.");
  } catch {
    toast.error("Could not publish the questions. Try again later.");
  } finally {
    publishingQuestionId.set(null);
  }
}, "publishQuestion").extend(withAsync());
