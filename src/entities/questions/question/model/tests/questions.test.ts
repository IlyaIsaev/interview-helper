import { notify } from "@reatom/core";
import { expect, test } from "vitest";

import {
  addToQuestions,
  initQuestions,
  questions,
  restoreToQuestions,
  updateInQuestions,
} from "../questions";

test("should sort questions alphabetically by visible text", () => {
  initQuestions([
    { id: "2", question: "Zebra" },
    { id: "1", question: "Apple" },
    { id: "3", question: "# Banana" },
  ]);
  notify();

  expect(questions()).toEqual([
    { id: "1", question: "Apple" },
    { id: "3", question: "# Banana" },
    { id: "2", question: "Zebra" },
  ]);
});

test("should keep alphabetical order when a question is added", () => {
  initQuestions([{ id: "2", question: "Zebra" }]);
  notify();

  addToQuestions({ id: "1", question: "Apple" });
  notify();

  expect(questions()).toEqual([
    { id: "1", question: "Apple" },
    { id: "2", question: "Zebra" },
  ]);
});

test("should re-sort when a question title changes", () => {
  initQuestions([
    { id: "1", question: "Zebra" },
    { id: "2", question: "Apple" },
  ]);
  notify();

  updateInQuestions({ id: "1", question: "Aardvark" });
  notify();

  expect(questions()).toEqual([
    { id: "1", question: "Aardvark" },
    { id: "2", question: "Apple" },
  ]);
});

test("should re-sort when a deleted question is restored", () => {
  initQuestions([{ id: "2", question: "Zebra" }]);
  notify();

  restoreToQuestions({ id: "1", question: "Apple" }, 1);
  notify();

  expect(questions()).toEqual([
    { id: "1", question: "Apple" },
    { id: "2", question: "Zebra" },
  ]);
});
