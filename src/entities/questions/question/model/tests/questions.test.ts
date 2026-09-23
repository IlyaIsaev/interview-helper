import { notify } from "@reatom/core";
import { expect, test } from "vitest";

import {
  addToQuestions,
  questions,
  restoreToQuestions,
  updateInQuestions,
  type Question,
} from "../questions";

const seedQuestions = (nextQuestions: ReadonlyArray<Question>) => {
  questions.data.set(nextQuestions);
  notify();
};

test("should append a question without reordering the list", () => {
  seedQuestions([
    { id: "2", question: "Zebra" },
    { id: "1", question: "Apple" },
  ]);

  addToQuestions({ id: "3", question: "# Banana" });
  notify();

  expect(questions.data()).toEqual([
    { id: "2", question: "Zebra" },
    { id: "1", question: "Apple" },
    { id: "3", question: "# Banana" },
  ]);
});

test("should keep the existing order when a question is added", () => {
  seedQuestions([{ id: "2", question: "Zebra" }]);

  addToQuestions({ id: "1", question: "Apple" });
  notify();

  expect(questions.data()).toEqual([
    { id: "2", question: "Zebra" },
    { id: "1", question: "Apple" },
  ]);
});

test("should replace a question in place when its title changes", () => {
  seedQuestions([
    { id: "1", question: "Zebra" },
    { id: "2", question: "Apple" },
  ]);

  updateInQuestions({ id: "1", question: "Aardvark" });
  notify();

  expect(questions.data()).toEqual([
    { id: "1", question: "Aardvark" },
    { id: "2", question: "Apple" },
  ]);
});

test("should insert a restored question at the given index", () => {
  seedQuestions([{ id: "2", question: "Zebra" }]);

  restoreToQuestions({ id: "1", question: "Apple" }, 0);
  notify();

  expect(questions.data()).toEqual([
    { id: "1", question: "Apple" },
    { id: "2", question: "Zebra" },
  ]);
});
