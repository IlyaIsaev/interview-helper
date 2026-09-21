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
import { UpdateQuestion, UpdateQuestionButton } from "@/features/questions/update-question";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { UserMenu } from "@/features/user/user-menu";
import { HOME_PATH, questionPath } from "@/shared/config";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  SidebarProvider,
  Spinner,
} from "@/shared/ui";

import { questionSearch, searchQuestions } from "../model/question-search";

const isQuestionsDialogOpen = reatomBoolean(false, "isQuestionsDialogOpen");

const closeQuestionsDialog = () => {
  isQuestionsDialogOpen.setFalse();
};

type LayoutProps = {
  children?: ReactNode;
};

type QuestionSidebarProps = {
  questions: ReadonlyArray<Question> | null;
  search: string;
};

const QuestionSidebar = reatomComponent(({ questions, search }: QuestionSidebarProps) => {
  if (questions === null) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (questions.length === 0 && search.trim().length === 0) {
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

  const currentPath = urlAtom().pathname;
  const isOpenedQuestion = (question: Question) => questionPath(question.id) === currentPath;
  const openedQuestionId = pipe(questions, find(isOpenedQuestion))?.id ?? null;

  const handleQuestionClick = wrap((questionId: string) => {
    openListedQuestion(questionId);

    closeQuestionsDialog();
  });

  const handleQuestionFormOpen = wrap(closeQuestionsDialog);

  function renderUpdateQuestion(question: Question) {
    return (
      <div className="contents" onClick={handleQuestionFormOpen}>
        <UpdateQuestionButton className="right-7" questionId={question.id} />
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
    <QuestionList
      questions={questions}
      activeQuestionId={openedQuestionId}
      activeAriaCurrent="page"
      onQuestionClick={handleQuestionClick}
      updateQuestion={renderUpdateQuestion}
      deleteQuestion={renderDeleteQuestion}
    />
  );
}, "QuestionSidebar");

const Layout = reatomComponent(({ children }: LayoutProps) => {
  const search = questionSearch();

  const changeQuestionsDialogOpen = wrap((isNextOpen: boolean) => {
    isQuestionsDialogOpen.set(isNextOpen);
  });

  const openQuestionsDialog = wrap(() => {
    isQuestionsDialogOpen.setTrue();
  });

  const handleCreateQuestionOpen = wrap(closeQuestionsDialog);

  const changeQuestionSearch = wrap((event: ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.currentTarget.value;

    questionSearch.set(nextSearch);

    questionsQuery.set(nextSearch.trim());

    searchQuestions();
  });

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <Dialog open={isQuestionsDialogOpen()} onOpenChange={changeQuestionsDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[85vh] min-h-0 flex-col gap-0 overflow-hidden p-0"
        >
          <SidebarProvider className="h-full min-h-0 w-full min-w-0 flex-col">
            <DialogHeader className="h-12 flex-row items-center gap-3 border-b border-sidebar-border px-3 py-0">
              <DialogTitle className="text-xs font-normal uppercase tracking-[2px] text-muted-foreground">
                Questions
              </DialogTitle>
              <div className="contents" onClick={handleCreateQuestionOpen}>
                <CreateQuestionButton />
              </div>
            </DialogHeader>
            <DialogDescription className="sr-only">Browse and open questions.</DialogDescription>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
              <div className="shrink-0 pb-2">
                <Label htmlFor="question-search">search</Label>
                <Input
                  id="question-search"
                  type="search"
                  value={search}
                  onChange={changeQuestionSearch}
                />
              </div>
              <QuestionSidebar questions={questions()} search={search} />
            </div>
          </SidebarProvider>
        </DialogContent>
      </Dialog>
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
          <UserMenu />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}, "Layout");

export default Layout;
