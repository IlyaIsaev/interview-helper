import { reatomBoolean, wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { type ChangeEvent, type ReactNode } from "react";

import { questionList } from "@/entities/question";
import { CreateQuestion, CreateQuestionButton } from "@/features/questions/create-question";
import { DeleteQuestion } from "@/features/questions/delete-question";
import { UpdateQuestion } from "@/features/questions/update-question";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { UserMenu } from "@/features/user/user-menu";
import { HOME_PATH } from "@/shared/config";
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

import { filteredQuestions, questionSearch } from "../model/question-search";
import { QuestionList } from "./question-list";

const isSidebarOpen = reatomBoolean(true, "isSidebarOpen");

type LayoutProps = {
  children?: ReactNode;
};

const Layout = reatomComponent(({ children }: LayoutProps) => {
  const questions = questionList();
  const visibleQuestions = filteredQuestions();
  const search = questionSearch();
  const changeSidebarOpen = wrap((isNextOpen: boolean) => {
    isSidebarOpen.set(isNextOpen);
  });
  const changeQuestionSearch = wrap((event: ChangeEvent<HTMLInputElement>) => {
    questionSearch.set(event.currentTarget.value);
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
            {questions === null || visibleQuestions === null ? (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <Spinner />
              </div>
            ) : questions.length === 0 ? (
              <p className="px-2 py-1 text-xs uppercase tracking-[1.5px] text-muted-foreground">
                no questions
              </p>
            ) : visibleQuestions.length === 0 ? (
              <p className="px-2 py-1 text-xs uppercase tracking-[1.5px] text-muted-foreground">
                no matches
              </p>
            ) : (
              <QuestionList questions={visibleQuestions} />
            )}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <CreateQuestion />
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
