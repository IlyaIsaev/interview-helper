import { reatomBoolean, urlAtom, wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { find, pipe } from "es-toolkit/fp";
import type { ChangeEvent, ReactNode } from "react";

import {
  openListedQuestion,
  QuestionList,
  questions,
  questionsQuery,
  type Question,
} from "@/entities/questions/question";
import { CreateQuestion, CreateQuestionButton } from "@/features/questions/create-question";
import { DeleteQuestion, DeleteQuestionButton } from "@/features/questions/delete-question";
import { PublishQuestionsButton } from "@/features/questions/publish-questions";
import { UpdateQuestion, UpdateQuestionButton } from "@/features/questions/update-question";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { UserMenu } from "@/features/user/user-menu";
import { HOME_PATH, questionPath } from "@/shared/config";
import { Button } from "@/shared/ui";

import { questionSearch, searchQuestions } from "../model/question-search";

const isQuestionsDialogOpen = reatomBoolean(false, "isQuestionsDialogOpen");

const closeQuestionsDialog = () => {
  isQuestionsDialogOpen.setFalse();
};

type LayoutProps = {
  children?: ReactNode;
};

const Layout = reatomComponent(({ children }: LayoutProps) => {
  const search = questionSearch();
  const listedQuestions = questions();
  const currentPath = urlAtom().pathname;
  const isOpenedQuestion = (question: Question) => questionPath(question.id) === currentPath;
  const openedQuestionId =
    listedQuestions === null ? null : (pipe(listedQuestions, find(isOpenedQuestion))?.id ?? null);

  const changeQuestionsDialogOpen = wrap((isNextOpen: boolean) => {
    isQuestionsDialogOpen.set(isNextOpen);
  });

  const openQuestionsDialog = wrap(() => {
    isQuestionsDialogOpen.setTrue();
  });

  const handleCreateQuestionOpen = wrap(closeQuestionsDialog);

  const handleQuestionClick = wrap((questionId: string) => {
    openListedQuestion(questionId);

    closeQuestionsDialog();
  });

  const handleQuestionFormOpen = wrap(closeQuestionsDialog);

  const changeQuestionSearch = wrap((event: ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.currentTarget.value;

    questionSearch.set(nextSearch);

    questionsQuery.set(nextSearch.trim());

    searchQuestions();
  });

  function renderCreateQuestion() {
    return (
      <div className="contents" onClick={handleCreateQuestionOpen}>
        <CreateQuestionButton />
      </div>
    );
  }

  function renderUpdateQuestion(question: Question) {
    return (
      <div className="contents" onClick={handleQuestionFormOpen}>
        <UpdateQuestionButton questionId={question.id} />
      </div>
    );
  }

  function renderDeleteQuestion(question: Question) {
    return (
      <div className="contents" onClick={handleQuestionFormOpen}>
        <DeleteQuestionButton questionId={question.id} />
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <QuestionList
        open={isQuestionsDialogOpen()}
        onOpenChange={changeQuestionsDialogOpen}
        questions={listedQuestions}
        search={search}
        onSearchChange={changeQuestionSearch}
        createQuestion={renderCreateQuestion()}
        activeQuestionId={openedQuestionId}
        activeAriaCurrent="page"
        onQuestionClick={handleQuestionClick}
        updateQuestion={renderUpdateQuestion}
        deleteQuestion={renderDeleteQuestion}
      />
      <CreateQuestion />
      <UpdateQuestion />
      <DeleteQuestion />
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
        <a className="text-sm uppercase tracking-[2px] text-muted-foreground" href={HOME_PATH}>
          Interview helper
        </a>
        <Button type="button" variant="ghost" onClick={openQuestionsDialog}>
          Questions
        </Button>
        <div className="ml-auto flex items-center gap-3">
          <PublishQuestionsButton />
          <UserMenu />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}, "Layout");

export default Layout;
