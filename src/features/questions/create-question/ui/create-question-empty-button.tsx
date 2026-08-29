import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { Button } from '@/shared/ui'

import { openCreateQuestion } from '../model/create-question'

export const CreateQuestionEmptyButton = reatomComponent(() => {
  const handleOpenCreateQuestion = wrap(openCreateQuestion)

  return (
    <Button type="button" onClick={handleOpenCreateQuestion}>
      Create question
    </Button>
  )
}, 'CreateQuestionEmptyButton')
