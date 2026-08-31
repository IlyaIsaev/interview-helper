import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Pencil } from 'lucide-react'

import { SidebarMenuAction } from '@/shared/ui'

import { openUpdateQuestion } from '../model/update-question'

type UpdateQuestionButtonProps = {
  className?: string
  questionId: string
}

export const UpdateQuestionButton = reatomComponent(
  ({ className, questionId }: UpdateQuestionButtonProps) => {
    const handleOpenUpdateQuestion = wrap(() => openUpdateQuestion(questionId))

    return (
      <SidebarMenuAction
        type="button"
        showOnHover
        className={className}
        aria-label="Update question"
        onClick={handleOpenUpdateQuestion}
      >
        <Pencil />
      </SidebarMenuAction>
    )
  },
  'UpdateQuestionButton',
)
