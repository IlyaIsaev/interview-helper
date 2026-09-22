import { computed } from "@reatom/core";

import { questionRoute, theoryOpenedRoute } from "@/app/routes";

import type { OpenedQuestion } from "./question";

export const question = computed((): OpenedQuestion | null => {
  if (questionRoute() !== null) return questionRoute.loader.data() ?? null;

  const openedOnTheory = theoryOpenedRoute();

  if (openedOnTheory?.id) return theoryOpenedRoute.loader.data() ?? null;

  return null;
}, "question");
