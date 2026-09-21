import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { Pencil } from "lucide-react";

import { Button } from "@/shared/ui";

import { openUpdateQuestion } from "../model/update-question";

type UpdateQuestionButtonProps = {
  questionId: string;
};

export const UpdateQuestionButton = reatomComponent(({ questionId }: UpdateQuestionButtonProps) => {
  const handleOpenUpdateQuestion = wrap(() => openUpdateQuestion(questionId));

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label="Update question"
      onClick={handleOpenUpdateQuestion}
    >
      <Pencil />
    </Button>
  );
}, "UpdateQuestionButton");
