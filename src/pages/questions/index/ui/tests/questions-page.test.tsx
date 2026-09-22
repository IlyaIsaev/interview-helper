import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { questions } from "@/entities/questions/question";

import QuestionsPage from "../questions-page";

vi.mock("@/shared/api", () => ({
  clientApi: {
    loadQuestions: vi.fn(async () => ({ questions: [] })),
    loadQuestion: vi.fn(async () => null),
  },
}));

test("should show create question when the questions list is empty", async () => {
  questions.data.set([]);

  const screen = await render(<QuestionsPage />);

  await expect.element(screen.getByRole("heading", { name: "Questions" })).toBeVisible();
  await expect.element(screen.getByText("the questions list is empty")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Create question" })).toBeVisible();
});
