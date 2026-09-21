import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/ui";

import { openDeleteQuestion } from "../model/delete-question";

type DeleteQuestionButtonProps = {
  questionId: string;
};

export const DeleteQuestionButton = reatomComponent(({ questionId }: DeleteQuestionButtonProps) => {
  const handleOpenDeleteQuestion = wrap(() => openDeleteQuestion(questionId));

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label="Delete question"
      onClick={handleOpenDeleteQuestion}
    >
      <Trash2 />
    </Button>
  );
}, "DeleteQuestionButton");
