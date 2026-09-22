import { computed, urlAtom } from "@reatom/core";
import type { DeepReadonly } from "es-toolkit/types";

import { QUESTIONS_PATH, THEORY_PATH } from "@/shared/config";

export type OpenedQuestion = DeepReadonly<{
  id: string;
  question: string;
  answer: string;
}>;

export const openedQuestionId = computed(() => {
  const url = urlAtom();

  if (url.pathname === THEORY_PATH) return url.searchParams.get("id") ?? "";

  const prefix = `${QUESTIONS_PATH}/`;

  if (!url.pathname.startsWith(prefix)) return "";

  const questionId = url.pathname.slice(prefix.length);

  if (questionId.length === 0 || questionId.includes("/")) return "";

  return questionId;
}, "openedQuestionId");
