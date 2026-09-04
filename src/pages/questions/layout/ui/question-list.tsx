import { urlAtom, wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { map, pipe } from 'es-toolkit/fp'
import { useRef } from 'react'

import { type QuestionListItem } from '@/entities/question'
import { DeleteQuestionButton } from '@/features/questions/delete-question'
import { UpdateQuestionButton } from '@/features/questions/update-question'
import { questionPath } from '@/shared/config'
import {
  Markdown,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui'

import {
  isQuestionPreviewOpen,
  openQuestionPreview,
  previewedQuestionId,
} from '../model/question-preview'

const questionRowSize = 36

type QuestionListProps = {
  questions: Array<QuestionListItem>
}

export const QuestionList = reatomComponent(({ questions }: QuestionListProps) => {
  const currentPath = urlAtom().pathname
  const isPreviewOpen = isQuestionPreviewOpen()
  const previewedId = previewedQuestionId()
  const questionListScroller = useRef<HTMLDivElement>(null)
  const questionListVirtualizer = useVirtualizer({
    count: questions.length,
    estimateSize: () => questionRowSize,
    getItemKey: (index) => questions[index]?.id ?? index,
    getScrollElement: () => questionListScroller.current,
    overscan: 8,
  })

  function questionMenuItem(row: VirtualItem) {
    const question = questions[row.index]

    if (!question) {
      return null
    }

    const isQuestionOpened = currentPath === questionPath(question.id)
    const isQuestionPreviewed = previewedId === question.id
    const isQuestionActive = isPreviewOpen ? isQuestionPreviewed : isQuestionOpened
    const questionAriaCurrent = isPreviewOpen
      ? isQuestionPreviewed || undefined
      : isQuestionOpened
        ? 'page'
        : undefined
    const handleOpenQuestionPreview = wrap(() => {
      openQuestionPreview(question.id)
    })

    return (
      <SidebarMenuItem
        key={question.id}
        className="absolute top-0 left-0 w-full"
        style={{ transform: `translateY(${row.start}px)` }}
      >
        <SidebarMenuButton
          type="button"
          isActive={isQuestionActive}
          aria-current={questionAriaCurrent}
          className="group-has-data-[sidebar=menu-action]/menu-item:pr-14"
          onClick={handleOpenQuestionPreview}
        >
          <Markdown plain>{question.question}</Markdown>
        </SidebarMenuButton>
        <UpdateQuestionButton className="right-7" questionId={question.id} />
        <DeleteQuestionButton questionId={question.id} />
      </SidebarMenuItem>
    )
  }

  return (
    <div ref={questionListScroller} className="min-h-0 flex-1 overflow-y-auto">
      <SidebarMenu
        className="relative gap-0"
        style={{ height: questionListVirtualizer.getTotalSize() }}
      >
        {pipe(questionListVirtualizer.getVirtualItems(), map(questionMenuItem))}
      </SidebarMenu>
    </div>
  )
}, 'QuestionList')
