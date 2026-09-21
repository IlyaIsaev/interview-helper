import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { map, pipe } from "es-toolkit/fp";
import { useState, type ReactNode } from "react";

import { cn } from "@/shared/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Markdown,
  markdownPlainText,
  Spinner,
} from "@/shared/ui";

import type { Question } from "../model/questions";

const QUESTION_HEIGHT = 36;

type QuestionListProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: ReadonlyArray<Question> | null;
  search: ReactNode;
  hasSearchQuery: boolean;
  createQuestion: ReactNode;
  activeQuestionId: string | null;
  activeAriaCurrent: true | "page";
  onQuestionClick: (questionId: string) => void;
  updateQuestion: (question: Question) => ReactNode;
  deleteQuestion: (question: Question) => ReactNode;
};

export function QuestionList({
  open,
  onOpenChange,
  questions,
  search,
  hasSearchQuery,
  createQuestion,
  activeQuestionId,
  activeAriaCurrent,
  onQuestionClick,
  updateQuestion,
  deleteQuestion,
}: QuestionListProps) {
  const [questionsScroller, setQuestionsScroller] = useState<HTMLDivElement | null>(null);
  const listedQuestions = questions ?? [];
  const questionsVirtualizer = useVirtualizer({
    count: listedQuestions.length,
    estimateSize: () => QUESTION_HEIGHT,
    getItemKey: (index) => listedQuestions[index]?.id ?? index,
    getScrollElement: () => questionsScroller,
    overscan: 8,
  });

  function questionRow(virtualQuestion: VirtualItem) {
    const question = listedQuestions[virtualQuestion.index];

    if (!question) return null;

    const isQuestionActive = activeQuestionId === question.id;
    const questionAriaCurrent = isQuestionActive ? activeAriaCurrent : undefined;

    const handleQuestionClick = () => {
      onQuestionClick(question.id);
    };

    return (
      <li
        key={question.id}
        role="listitem"
        className={cn(
          "group/question-item absolute top-0 left-0 flex w-full items-center",
          isQuestionActive && "bg-accent text-accent-foreground",
        )}
        style={{ height: QUESTION_HEIGHT, transform: `translateY(${virtualQuestion.start}px)` }}
      >
        <Button
          type="button"
          variant="ghost"
          aria-current={questionAriaCurrent}
          className="h-9 min-w-0 flex-1 justify-start overflow-hidden text-left font-normal normal-case tracking-normal hover:bg-transparent hover:text-inherit"
          title={markdownPlainText(question.question)}
          onClick={handleQuestionClick}
        >
          <Markdown plain>{question.question}</Markdown>
        </Button>
        <div className="flex shrink-0 items-center transition-opacity md:opacity-0 md:group-hover/question-item:opacity-100 md:group-focus-within/question-item:opacity-100">
          {updateQuestion(question)}
          {deleteQuestion(question)}
        </div>
      </li>
    );
  }

  function questionsBody() {
    if (questions === null) {
      return (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (questions.length === 0 && !hasSearchQuery) {
      return (
        <p className="px-2 py-1 text-xs uppercase tracking-[1.5px] text-muted-foreground">
          no questions
        </p>
      );
    }

    if (questions.length === 0) {
      return (
        <p className="px-2 py-1 text-xs uppercase tracking-[1.5px] text-muted-foreground">
          no matches
        </p>
      );
    }

    return (
      <div ref={setQuestionsScroller} className="min-h-64 flex-1 overflow-y-auto">
        <ul
          className="relative m-0 list-none p-0"
          role="list"
          style={{ height: questionsVirtualizer.getTotalSize() }}
        >
          {pipe(questionsVirtualizer.getVirtualItems(), map(questionRow))}
        </ul>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex! max-h-[85vh] min-h-0 flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="h-12 flex-row items-center gap-3 border-b border-border px-3 py-0 text-left">
          <DialogTitle className="text-xs font-normal uppercase tracking-[2px] text-muted-foreground">
            Questions
          </DialogTitle>
          {createQuestion}
        </DialogHeader>
        <DialogDescription className="sr-only">Browse and open questions.</DialogDescription>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
          <div className="shrink-0 pb-2">{search}</div>
          {questionsBody()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
