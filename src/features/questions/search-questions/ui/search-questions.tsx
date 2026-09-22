import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import type { ChangeEvent } from "react";

import { questionSearch } from "@/entities/questions/question";
import { Input, Label } from "@/shared/ui";

export const SearchQuestions = reatomComponent(() => {
  const handleQuestionSearchChange = wrap((event: ChangeEvent<HTMLInputElement>) => {
    questionSearch.set(event.currentTarget.value);
  });

  return (
    <>
      <Label htmlFor="question-search">search</Label>
      <Input
        id="question-search"
        type="search"
        value={questionSearch()}
        onChange={handleQuestionSearchChange}
      />
    </>
  );
}, "SearchQuestions");
