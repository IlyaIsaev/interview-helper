import { urlAtom } from "@reatom/core";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { initQuestion, initQuestions, openedQuestionId } from "@/entities/questions/question";
import { THEORY_PATH } from "@/shared/config";

import TheoryPage from "../theory-page";

const firstQuestionId = "11111111-1111-1111-1111-111111111111";
const secondQuestionId = "22222222-2222-2222-2222-222222222222";

const openTheoryPage = () => {
  urlAtom.go(THEORY_PATH);
  openedQuestionId.set("");
  initQuestion(null);
};

test("should show create question when the questions list is empty", async () => {
  openTheoryPage();
  initQuestions([]);

  const screen = await render(<TheoryPage />);

  await expect.element(screen.getByRole("heading", { name: "Theory" })).toBeVisible();
  await expect.element(screen.getByText("the questions list is empty")).toBeVisible();
  await expect.element(screen.getByText("Create question")).toBeVisible();
});

test("should show question triggers without answers", async () => {
  openTheoryPage();
  initQuestions([
    { id: firstQuestionId, question: "First question" },
    { id: secondQuestionId, question: "Second question" },
  ]);

  const screen = await render(<TheoryPage />);

  await expect.element(screen.getByRole("button", { name: "First question" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Second question" })).toBeVisible();
  await expect.element(screen.getByText("First answer")).not.toBeInTheDocument();
  await expect.element(screen.getByText("Second answer")).not.toBeInTheDocument();
});

test("should add the question id search param when a trigger opens", async () => {
  openTheoryPage();
  initQuestions([{ id: firstQuestionId, question: "First question" }]);

  const screen = await render(<TheoryPage />);

  await userEvent.click(screen.getByRole("button", { name: "First question" }));

  expect(openedQuestionId()).toBe(firstQuestionId);
  expect(urlAtom().pathname).toBe(THEORY_PATH);
  expect(urlAtom().searchParams.get("id")).toBe(firstQuestionId);
});

test("should show the answer after the opened question loads", async () => {
  openTheoryPage();
  initQuestions([{ id: firstQuestionId, question: "First question" }]);
  openedQuestionId.set(firstQuestionId);
  initQuestion({
    id: firstQuestionId,
    question: "First question",
    answer: "First answer",
  });

  const screen = await render(<TheoryPage />);

  await expect.element(screen.getByRole("button", { name: "First question" })).toBeVisible();
  await expect.element(screen.getByText("First answer")).toBeVisible();
});

test("should show question not found when the opened id is missing", async () => {
  openTheoryPage();
  openedQuestionId.set("abc");
  initQuestions([]);
  initQuestion(null);

  const screen = await render(<TheoryPage />);

  await expect.element(screen.getByRole("heading", { name: "Theory" })).toBeVisible();
  await expect.element(screen.getByText("question not found")).toBeVisible();
  await expect.element(screen.getByText("the questions list is empty")).not.toBeInTheDocument();
});

test("should include hover-revealed update and delete actions on an accordion item", async () => {
  openTheoryPage();
  initQuestions([{ id: firstQuestionId, question: "First question" }]);

  const screen = await render(<TheoryPage />);
  const updateQuestion = screen.getByRole("button", { name: "Update question" });
  const questionActions = updateQuestion.element().parentElement;

  await expect.element(updateQuestion).toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Delete question" })).toBeInTheDocument();

  if (!questionActions) throw new Error("Missing question actions");

  const chevronTrigger = questionActions.parentElement?.querySelector(
    '[data-slot="accordion-trigger-icon"]',
  );

  if (!chevronTrigger) throw new Error("Missing accordion chevron");

  expect(questionActions.className).toContain("md:opacity-0");
  expect(questionActions.className).toContain("md:group-hover/accordion-item:opacity-100");
  expect(questionActions.className).toContain("md:group-focus-within/accordion-item:opacity-100");
  expect(
    updateQuestion.element().compareDocumentPosition(chevronTrigger) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

test("should clear the question id search param when the open trigger collapses", async () => {
  openTheoryPage();
  initQuestions([{ id: firstQuestionId, question: "First question" }]);
  openedQuestionId.set(firstQuestionId);
  initQuestion({
    id: firstQuestionId,
    question: "First question",
    answer: "First answer",
  });

  const screen = await render(<TheoryPage />);

  await userEvent.click(screen.getByRole("button", { name: "First question" }));

  expect(openedQuestionId()).toBe("");
  expect(urlAtom().pathname).toBe(THEORY_PATH);
  expect(urlAtom().searchParams.get("id")).toBeNull();
});
