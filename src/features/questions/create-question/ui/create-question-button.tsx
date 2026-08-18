import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui'

import { openCreateQuestion } from '../model/create-question'

export const CreateQuestionButton = reatomComponent(() => {
  const handleOpenCreateQuestion = wrap(openCreateQuestion)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="ml-auto size-7"
      aria-label="Create question"
      onClick={handleOpenCreateQuestion}
    >
      <Plus />
    </Button>
  )
}, 'CreateQuestionButton')
