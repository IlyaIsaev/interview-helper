import { reatomBoolean, urlAtom, wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { map, pipe } from "es-toolkit/fp";
import { Children, type ReactNode } from "react";

import { questionList, type QuestionListItem } from "@/entities/question";
import { CreateQuestion, CreateQuestionButton } from "@/features/questions/create-question";
import { DeleteQuestion, DeleteQuestionButton } from "@/features/questions/delete-question";
import { UpdateQuestion, UpdateQuestionButton } from "@/features/questions/update-question";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { UserMenu } from "@/features/user-menu";
import { HOME_PATH, questionPath } from "@/shared/config";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Spinner,
} from "@/shared/ui";

import HomePage from "./home-page";

const isSidebarOpen = reatomBoolean(true, "isSidebarOpen");

type LayoutProps = {
  children?: ReactNode;
};

const Layout = reatomComponent(({ children }: LayoutProps) => {
  const isOpen = isSidebarOpen();
  const questions = questionList();
  const openedQuestionPath = urlAtom().pathname;
  const changeSidebarOpen = wrap((isNextOpen: boolean) => {
    isSidebarOpen.set(isNextOpen);
  });

  function questionMenuItem(question: QuestionListItem) {
    const questionHref = questionPath(question.id);
    const isOpenedQuestion = openedQuestionPath === questionHref;

    return (
      <SidebarMenuItem key={question.id}>
        <SidebarMenuButton
          asChild
          isActive={isOpenedQuestion}
          className="group-has-data-[sidebar=menu-action]/menu-item:pr-14"
        >
          <a aria-current={isOpenedQuestion ? "page" : undefined} href={questionHref}>
            <span>{question.question}</span>
          </a>
        </SidebarMenuButton>
        <UpdateQuestionButton className="right-7" questionId={question.id} />
        <DeleteQuestionButton questionId={question.id} />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarProvider open={isOpen} onOpenChange={changeSidebarOpen}>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="h-12 flex-row items-center gap-3 border-b border-sidebar-border px-3 py-0">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground">Questions</p>
          <CreateQuestionButton />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel className="uppercase tracking-[1.5px]">menu</SidebarGroupLabel>
            {questions === null ? (
              <div className="flex flex-1 items-center justify-center">
                <Spinner />
              </div>
            ) : questions.length === 0 ? (
              <p className="px-2 py-1 text-xs uppercase tracking-[1.5px] text-muted-foreground">
                no questions
              </p>
            ) : (
              <SidebarMenu>{pipe(questions, map(questionMenuItem))}</SidebarMenu>
            )}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <CreateQuestion />
      <UpdateQuestion />
      <DeleteQuestion />
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b border-border px-3">
          <SidebarTrigger />
          <a className="text-sm uppercase tracking-[2px] text-muted-foreground" href={HOME_PATH}>
            Interview helper
          </a>
          <div className="ml-auto flex items-center gap-3">
            <UserMenu />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="min-w-0 flex-1">
          {Children.count(children) === 0 ? <HomePage /> : Children.toArray(children)}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}, "Layout");

export default Layout;
