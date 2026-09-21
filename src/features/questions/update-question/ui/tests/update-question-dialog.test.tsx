import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { isUpdateQuestionDialogOpen } from "../../model/update-question";
import { UpdateQuestion } from "../update-question-dialog";

test("should disable update submit with a tooltip when the user is unregistered", async () => {
  isUpdateQuestionDialogOpen.setTrue();

  const screen = await render(<UpdateQuestion />);
  const updateSubmit = screen.getByRole("button", { name: "Update", exact: true });

  await expect.element(screen.getByRole("heading", { name: "Update question" })).toBeVisible();
  await expect.element(updateSubmit).toBeDisabled();

  await userEvent.hover(updateSubmit);

  await expect
    .element(screen.getByRole("tooltip", { name: "Sign in to update a question" }))
    .toBeVisible();
});
