import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { map, pipe } from "es-toolkit/fp";
import { useRef, type ReactNode } from "react";

import {
  Markdown,
  markdownPlainText,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui";

import type { Question } from "../model/questions";

const QUESTION_HEIGHT = 36;

type QuestionListProps = {
  questions: ReadonlyArray<Question>;
  activeQuestionId: string | null;
  activeAriaCurrent: true | "page";
  onQuestionClick: (questionId: string) => void;
  updateQuestion: (question: Question) => ReactNode;
  deleteQuestion: (question: Question) => ReactNode;
};

export function QuestionList({
  questions,
  activeQuestionId,
  activeAriaCurrent,
  onQuestionClick,
  updateQuestion,
  deleteQuestion,
}: QuestionListProps) {
  const questionsScroller = useRef<HTMLDivElement>(null);
  const questionsVirtualizer = useVirtualizer({
    count: questions.length,
    estimateSize: () => QUESTION_HEIGHT,
    getItemKey: (index) => questions[index]?.id ?? index,
    getScrollElement: () => questionsScroller.current,
    overscan: 8,
  });

  function questionMenu(virtualQuestion: VirtualItem) {
    const question = questions[virtualQuestion.index];

    if (!question) return null;

    const isQuestionActive = activeQuestionId === question.id;
    const questionAriaCurrent = isQuestionActive ? activeAriaCurrent : undefined;

    const handleQuestionClick = () => {
      onQuestionClick(question.id);
    };

    return (
      <SidebarMenuItem
        key={question.id}
        className="absolute top-0 left-0 w-full"
        style={{ transform: `translateY(${virtualQuestion.start}px)` }}
      >
        <SidebarMenuButton
          type="button"
          isActive={isQuestionActive}
          aria-current={questionAriaCurrent}
          className="group-has-data-[sidebar=menu-action]/menu-item:pr-14"
          title={markdownPlainText(question.question)}
          onClick={handleQuestionClick}
        >
          <Markdown plain>{question.question}</Markdown>
        </SidebarMenuButton>
        {updateQuestion(question)}
        {deleteQuestion(question)}
      </SidebarMenuItem>
    );
  }

  return (
    <div ref={questionsScroller} className="min-h-0 flex-1 overflow-y-auto">
      <SidebarMenu
        className="relative gap-0"
        style={{ height: questionsVirtualizer.getTotalSize() }}
      >
        {pipe(questionsVirtualizer.getVirtualItems(), map(questionMenu))}
      </SidebarMenu>
    </div>
  );
}
