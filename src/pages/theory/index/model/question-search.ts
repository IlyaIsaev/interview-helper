import { action, reatomString, sleep, withAbort, wrap } from "@reatom/core";

import { refetchQuestions } from "@/entities/questions/question";

export const theoryQuestionSearch = reatomString("", "theoryQuestionSearch");

export const searchTheoryQuestions = action(async () => {
  await wrap(sleep(300));

  await wrap(refetchQuestions());
}, "searchTheoryQuestions").extend(withAbort());
