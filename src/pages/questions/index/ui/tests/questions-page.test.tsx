import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { initQuestions } from "@/entities/questions/question";

import QuestionsPage from "../questions-page";

test("should show create question when the questions list is empty", async () => {
  initQuestions([]);

  const screen = await render(<QuestionsPage />);

  await expect.element(screen.getByRole("heading", { name: "Questions" })).toBeVisible();
  await expect.element(screen.getByText("the questions list is empty")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Create question" })).toBeVisible();
});
