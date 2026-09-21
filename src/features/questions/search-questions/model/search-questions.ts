import { action, reatomString, sleep, withAbort, wrap } from "@reatom/core";

import { questionsQuery, refetchQuestions } from "@/entities/questions/question";

export const questionSearch = reatomString("", "questionSearch");

export const searchQuestions = action(async () => {
  await wrap(sleep(300));

  await wrap(refetchQuestions());
}, "searchQuestions").extend(withAbort());

export const changeQuestionSearch = action((nextSearch: string) => {
  questionSearch.set(nextSearch);

  questionsQuery.set(nextSearch.trim());

  searchQuestions();
}, "changeQuestionSearch");
