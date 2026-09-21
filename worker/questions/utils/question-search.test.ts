import { expect, test } from "vitest";

import { questionsMatchingSearch } from "./question-search";

test("should return every question when the search is empty", () => {
  const questions = [
    { id: "1", question: "# Hello field" },
    { id: "2", question: "Other" },
  ];

  expect(questionsMatchingSearch(questions, "")).toEqual(questions);

  expect(questionsMatchingSearch(questions, "   ")).toEqual(questions);
});

test("should match visible question text when the query ignores markdown syntax", () => {
  const questions = [
    { id: "1", question: "# Hello field" },
    { id: "2", question: "Other" },
  ];

  expect(questionsMatchingSearch(questions, "hello")).toEqual([
    { id: "1", question: "# Hello field" },
  ]);

  expect(questionsMatchingSearch(questions, "#")).toEqual([]);
});

test("should sort questions alphabetically by visible text", () => {
  const questions = [
    { id: "2", question: "Zebra" },
    { id: "1", question: "Apple" },
    { id: "3", question: "# Banana" },
  ];

  expect(questionsMatchingSearch(questions, "")).toEqual([
    { id: "1", question: "Apple" },
    { id: "3", question: "# Banana" },
    { id: "2", question: "Zebra" },
  ]);
});
