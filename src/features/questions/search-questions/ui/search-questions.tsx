import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import type { ChangeEvent } from "react";

import { Input, Label } from "@/shared/ui";

import { changeQuestionSearch, questionSearch } from "../model/search-questions";

export const SearchQuestions = reatomComponent(() => {
  const handleQuestionSearchChange = wrap((event: ChangeEvent<HTMLInputElement>) => {
    changeQuestionSearch(event.currentTarget.value);
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
