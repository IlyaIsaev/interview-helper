import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { SearchQuestions } from "../search-questions";

test("should show the questions search field", async () => {
  const screen = await render(<SearchQuestions />);

  await expect.element(screen.getByRole("searchbox", { name: "search" })).toBeVisible();
});
