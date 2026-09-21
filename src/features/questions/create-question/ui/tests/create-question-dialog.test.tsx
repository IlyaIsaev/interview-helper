import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { isCreateQuestionDialogOpen } from "../../model/create-question";
import { CreateQuestion } from "../create-question-dialog";

test("should disable create submit with a tooltip when the user is unregistered", async () => {
  isCreateQuestionDialogOpen.setTrue();

  const screen = await render(<CreateQuestion />);
  const createSubmit = screen.getByRole("button", { name: "Create", exact: true });

  await expect.element(screen.getByRole("heading", { name: "Create question" })).toBeVisible();
  await expect.element(createSubmit).toBeDisabled();

  await userEvent.hover(createSubmit);

  await expect
    .element(screen.getByRole("tooltip", { name: "Sign in to create a question" }))
    .toBeVisible();
});
