import { action, atom, urlAtom, withSearchParams } from "@reatom/core";
import { pick, pipe } from "es-toolkit/fp";
import type { DeepReadonly } from "es-toolkit/types";

import { questionPath, THEORY_PATH } from "@/shared/config";

export type OpenedQuestion = DeepReadonly<{
  id: string;
  question: string;
  answer: string;
}>;

export const question = atom<OpenedQuestion | null>(null, "question");

export const openedQuestionId = atom("", "openedQuestionId").extend(
  withSearchParams("id", {
    parse: (value) => value ?? "",
    serialize: (value) => (value.length === 0 ? undefined : value),
    path: THEORY_PATH,
  }),
);

export const initQuestion = action((nextQuestion: OpenedQuestion | null) => {
  if (!nextQuestion) {
    question.set(null);

    return;
  }

  question.set(pipe(nextQuestion, pick(["id", "question", "answer"])));
}, "initQuestion");

export const openQuestion = action((questionId: string) => {
  if (urlAtom().pathname === THEORY_PATH) {
    openedQuestionId.set(questionId);

    return;
  }

  urlAtom.go(questionPath(questionId));
}, "openQuestion");
