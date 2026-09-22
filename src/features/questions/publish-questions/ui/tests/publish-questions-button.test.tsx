import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { PublishQuestionButton } from "../publish-questions-button";

test("should hide publish when the user is unregistered", async () => {
  const screen = await render(<PublishQuestionButton questionId="question-id" />);

  await expect
    .element(screen.getByRole("button", { name: "Publish question" }))
    .not.toBeInTheDocument();
});
