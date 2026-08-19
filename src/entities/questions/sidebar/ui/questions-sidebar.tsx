import { reatomComponent } from '@reatom/react'
import type { ReactNode } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Spinner,
} from '@/shared/ui'

import { questionList } from '../model/question-list'

type QuestionsSidebarProps = {
  headerAction?: ReactNode
  renderQuestion: (question: string, questionId: string) => ReactNode
}

export const QuestionsSidebar = reatomComponent(
  ({ headerAction, renderQuestion }: QuestionsSidebarProps) => {
    const questions = questionList()

    return (
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="h-12 flex-row items-center gap-3 border-b border-sidebar-border px-3 py-0">
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
            Questions
          </p>
          {headerAction}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel className="uppercase tracking-[1.5px]">
              menu
            </SidebarGroupLabel>
            {questions === null ? (
              <div className="flex flex-1 items-center justify-center">
                <Spinner />
              </div>
            ) : questions.length === 0 ? (
              <p className="px-2 py-1 text-xs uppercase tracking-[1.5px] text-muted-foreground">
                no questions
              </p>
            ) : (
              <SidebarMenu>
                {questions.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      {renderQuestion(item.question, item.id)}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  },
  'QuestionsSidebar',
)
