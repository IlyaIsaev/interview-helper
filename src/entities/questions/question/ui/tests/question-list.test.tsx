import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { markdownPlainText } from "@/shared/ui";

import type { Question } from "../../model/questions";
import { QuestionList } from "../question-list";

const firstQuestion = {
  id: "11111111-1111-1111-1111-111111111111",
  question: "First question",
};

const secondQuestion = {
  id: "22222222-2222-2222-2222-222222222222",
  question: "Second question",
};

const markedUpQuestion = {
  id: "33333333-3333-3333-3333-333333333333",
  question: "# Hello\n\n**bold**",
};

type RenderQuestionListOptions = {
  onQuestionClick?: (questionId: string) => void;
  questions?: ReadonlyArray<Question>;
};

async function renderQuestionList({
  onQuestionClick = () => {},
  questions = [firstQuestion, secondQuestion],
}: RenderQuestionListOptions = {}) {
  function renderUpdateQuestion(question: Question) {
    return <span>{`update ${question.id}`}</span>;
  }

  function renderDeleteQuestion(question: Question) {
    return <span>{`delete ${question.id}`}</span>;
  }

  return render(
    <QuestionList
      open
      onOpenChange={() => {}}
      questions={questions}
      search={<input />}
      hasSearchQuery={false}
      createQuestion={null}
      activeQuestionId={questions[0]?.id ?? null}
      activeAriaCurrent="page"
      onQuestionClick={onQuestionClick}
      updateQuestion={renderUpdateQuestion}
      deleteQuestion={renderDeleteQuestion}
    />,
  );
}

test("should include hover-revealed update and delete slots on a question item", async () => {
  const screen = await renderQuestionList();
  const updateQuestion = screen.getByText(`update ${firstQuestion.id}`);
  const questionActions = updateQuestion.element().parentElement;

  await expect.element(screen.getByRole("dialog", { name: "Questions" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "First question" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Second question" })).toBeVisible();
  await expect.element(updateQuestion).toBeInTheDocument();
  await expect.element(screen.getByText(`delete ${firstQuestion.id}`)).toBeInTheDocument();

  if (!questionActions) throw new Error("Missing question actions");

  expect(questionActions.className).toContain("md:opacity-0");
  expect(questionActions.className).toContain("md:group-hover/question-item:opacity-100");
  expect(questionActions.className).toContain("md:group-focus-within/question-item:opacity-100");
});

test("should call onQuestionClick when a question row is clicked", async () => {
  const clicks: Array<string> = [];
  const screen = await renderQuestionList({
    onQuestionClick: (questionId) => {
      clicks.push(questionId);
    },
  });

  await userEvent.click(screen.getByRole("button", { name: "Second question" }));

  expect(clicks).toEqual([secondQuestion.id]);
});

test("should expose a markdown-free title when a question contains markup", async () => {
  const screen = await renderQuestionList({
    questions: [markedUpQuestion],
  });

  await expect
    .element(screen.getByRole("button", { name: /Hello\s+bold/ }))
    .toHaveAttribute("title", markdownPlainText(markedUpQuestion.question));
});

test("should left-align rows without hover fill when the questions list renders", async () => {
  const screen = await renderQuestionList();
  const activeQuestion = screen.getByRole("button", { name: "First question" });
  const inactiveQuestion = screen.getByRole("button", { name: "Second question" });
  const activeQuestionItem = activeQuestion.element().closest("li");
  const inactiveQuestionItem = inactiveQuestion.element().closest("li");

  await expect.element(activeQuestion).toBeVisible();
  await expect.element(inactiveQuestion).toBeVisible();

  if (!activeQuestionItem) throw new Error("Missing active question item");
  if (!inactiveQuestionItem) throw new Error("Missing inactive question item");

  expect(activeQuestionItem.className).toContain("bg-accent");
  expect(activeQuestionItem.className).toContain("text-accent-foreground");
  expect(inactiveQuestionItem.className).not.toContain("bg-accent");
  expect(activeQuestion.element().className).toContain("text-left");
  expect(activeQuestion.element().className).toContain("hover:bg-transparent");
  expect(activeQuestion.element().className).not.toContain("bg-accent");
  expect(inactiveQuestion.element().className).toContain("text-left");
  expect(inactiveQuestion.element().className).toContain("hover:bg-transparent");
  expect(inactiveQuestion.element().className).not.toContain("bg-accent");
});
