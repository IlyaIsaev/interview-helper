import { action, isAbort, reatomBoolean, withAsync, wrap } from "@reatom/core";

import { signInRoute } from "@/app/routes";
import { clientApi } from "@/shared/api";
import { session } from "@/shared/auth";
import { toast } from "@/shared/ui";

export const isDeleteUserDialogOpen = reatomBoolean(false, "isDeleteUserDialogOpen");

export const openDeleteUser = isDeleteUserDialogOpen.setTrue;

export const closeDeleteUserDialog = isDeleteUserDialogOpen.setFalse;

export const deleteUser = action(async () => {
  try {
    await wrap(clientApi.deleteUser());
  } catch (error) {
    if (isAbort(error)) return;

    toast.error("Could not delete the account. Try again later.");

    throw error instanceof Error
      ? error
      : new Error("Could not delete the account. Try again later.");
  }

  closeDeleteUserDialog();

  await wrap(session.retry());

  signInRoute.go();
}, "deleteUser").extend(withAsync());
