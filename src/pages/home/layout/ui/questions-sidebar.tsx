import { urlAtom } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { map, pipe } from 'es-toolkit/fp'

import { questionList, type QuestionListItem } from '@/entities/question'
import { CreateQuestionButton } from '@/features/questions/create-question'
import { DeleteQuestionButton } from '@/features/questions/delete-question'
import { UpdateQuestionButton } from '@/features/questions/update-question'
import { questionPath } from '@/shared/config'
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

export const QuestionsSidebar = reatomComponent(() => {
  const questions = questionList()
  const openedQuestionPath = urlAtom().pathname

  function questionMenuItem(question: QuestionListItem) {
    const questionHref = questionPath(question.id)
    const isOpenedQuestion = openedQuestionPath === questionHref

    return (
      <SidebarMenuItem key={question.id}>
        <SidebarMenuButton
          asChild
          isActive={isOpenedQuestion}
          className="group-has-data-[sidebar=menu-action]/menu-item:pr-14"
        >
          <a
            aria-current={isOpenedQuestion ? 'page' : undefined}
            href={questionHref}
          >
            <span>{question.question}</span>
          </a>
        </SidebarMenuButton>
        <UpdateQuestionButton className="right-7" questionId={question.id} />
        <DeleteQuestionButton questionId={question.id} />
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="h-12 flex-row items-center gap-3 border-b border-sidebar-border px-3 py-0">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          Questions
        </p>
        <CreateQuestionButton />
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
              {pipe(questions, map(questionMenuItem))}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}, 'QuestionsSidebar')
