import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { Upload } from "lucide-react";

import { isSignedIn } from "@/shared/auth";
import { Button, Spinner } from "@/shared/ui";

import { publishingQuestionId, publishQuestion } from "../model/publish-questions";

type PublishQuestionButtonProps = {
  questionId: string;
};

export const PublishQuestionButton = reatomComponent(
  ({ questionId }: PublishQuestionButtonProps) => {
    if (!isSignedIn()) return null;

    const isPublishReady = publishQuestion.ready();
    const isPublishingThisQuestion = publishingQuestionId() === questionId;
    const handlePublishQuestion = wrap(() => publishQuestion(questionId));

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Publish question"
        disabled={!isPublishReady}
        onClick={handlePublishQuestion}
      >
        {isPublishingThisQuestion ? <Spinner /> : <Upload />}
      </Button>
    );
  },
  "PublishQuestionButton",
);
