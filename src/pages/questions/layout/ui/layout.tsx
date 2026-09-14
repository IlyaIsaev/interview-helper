import { reatomBoolean, urlAtom, wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import type { ChangeEvent, ReactNode } from "react";

import {
  QuestionList,
  QuestionPreview,
  questions,
  questionsQuery,
  type Question,
} from "@/entities/question";
import { CreateQuestion, CreateQuestionButton } from "@/features/questions/create-question";
import { DeleteQuestion, DeleteQuestionButton } from "@/features/questions/delete-question";
import { UpdateQuestion, UpdateQuestionButton } from "@/features/questions/update-question";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { UserMenu } from "@/features/user/user-menu";
import { HOME_PATH, questionPath } from "@/shared/config";
import {
  Input,
  Label,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Spinner,
} from "@/shared/ui";

import {
  closeQuestionPreview,
  isQuestionPreviewOpen,
  openQuestionPreview,
  previewedQuestion,
  previewedQuestionId,
} from "../model/question-preview";
import { questionSearch, searchQuestions } from "../model/question-search";

const isSidebarOpen = reatomBoolean(true, "isSidebarOpen");

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
  const isPreviewOpen = isQuestionPreviewOpen();
  const previewedId = previewedQuestionId();
  const isOpenedQuestion = (question: Question) => questionPath(question.id) === currentPath;
  const openedQuestionId = questions.find(isOpenedQuestion)?.id ?? null;
  const handleQuestionClick = wrap((questionId: string) => {
    openQuestionPreview(questionId);
  });

  function renderUpdateQuestion(question: Question) {
    return <UpdateQuestionButton className="right-7" questionId={question.id} />;
  }

  function renderDeleteQuestion(question: Question) {
    return <DeleteQuestionButton questionId={question.id} />;
  }

  return (
    <QuestionList
      questions={questions}
      activeQuestionId={isPreviewOpen ? previewedId : openedQuestionId}
      activeAriaCurrent={isPreviewOpen ? true : "page"}
      onQuestionClick={handleQuestionClick}
      updateQuestion={renderUpdateQuestion}
      deleteQuestion={renderDeleteQuestion}
    />
  );
}, "QuestionSidebar");

const Layout = reatomComponent(({ children }: LayoutProps) => {
  const search = questionSearch();
  const changeQuestionPreviewOpen = wrap((shouldOpen: boolean) => {
    if (shouldOpen) {
      isQuestionPreviewOpen.setTrue();

      return;
    }

    closeQuestionPreview();
  });
  const changeSidebarOpen = wrap((isNextOpen: boolean) => {
    isSidebarOpen.set(isNextOpen);
  });
  const changeQuestionSearch = wrap((event: ChangeEvent<HTMLInputElement>) => {
    const nextSearch = event.currentTarget.value;

    questionSearch.set(nextSearch);

    questionsQuery.set(nextSearch.trim());

    searchQuestions();
  });

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      open={isSidebarOpen()}
      onOpenChange={changeSidebarOpen}
    >
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="h-12 flex-row items-center gap-3 border-b border-sidebar-border px-3 py-0">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground">Questions</p>
          <CreateQuestionButton />
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <SidebarGroup className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <CreateQuestion />
      <QuestionPreview
        open={isQuestionPreviewOpen()}
        question={previewedQuestion()}
        onOpenChange={changeQuestionPreviewOpen}
      />
      <UpdateQuestion />
      <DeleteQuestion />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
          <SidebarTrigger />
          <a className="text-sm uppercase tracking-[2px] text-muted-foreground" href={HOME_PATH}>
            Interview helper
          </a>
          <div className="ml-auto flex items-center gap-3">
            <UserMenu />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}, "Layout");

export default Layout;
