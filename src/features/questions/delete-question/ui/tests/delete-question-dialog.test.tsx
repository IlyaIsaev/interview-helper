import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { isDeleteQuestionDialogOpen } from "../../model/delete-question";
import { DeleteQuestion } from "../delete-question-dialog";

test("should disable delete submit with a tooltip when the user is unregistered", async () => {
  isDeleteQuestionDialogOpen.setTrue();

  const screen = await render(<DeleteQuestion />);
  const deleteSubmit = screen.getByRole("button", { name: "Delete" });

  await expect.element(screen.getByRole("heading", { name: "Delete question" })).toBeVisible();
  await expect.element(deleteSubmit).toBeDisabled();

  await userEvent.hover(deleteSubmit);

  await expect
    .element(screen.getByRole("tooltip", { name: "Sign in to delete a question" }))
    .toBeVisible();
});
