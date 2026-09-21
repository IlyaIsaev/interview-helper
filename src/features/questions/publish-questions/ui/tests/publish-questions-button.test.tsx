import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { PublishQuestionsButton } from "../publish-questions-button";

test("should hide publish when the user is unregistered", async () => {
  const screen = await render(<PublishQuestionsButton />);

  await expect.element(screen.getByRole("button", { name: "Publish" })).not.toBeInTheDocument();
});
