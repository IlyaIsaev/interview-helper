import { reatomComponent } from '@reatom/react'

import { questionList } from '@/entities/questions/sidebar'
import { CreateQuestionEmptyButton } from '@/features/questions/create-question'
import { Spinner } from '@/shared/ui'

const QuestionsPage = reatomComponent(() => {
  const questions = questionList()

  if (questions === null) {
    return (
      <section className="flex min-h-full items-center justify-center">
        <Spinner className="size-6" />
        <span className="sr-only">loading</span>
      </section>
    )
  }

  if (questions.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          questions
        </p>
        <h1 className="text-heading font-medium tracking-tight">Questions</h1>
        <p className="text-ui uppercase tracking-[2px] text-muted-foreground">
          the questions list is empty
        </p>
        <CreateQuestionEmptyButton />
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        questions
      </p>
      <h1 className="text-heading font-medium tracking-tight">Questions</h1>
    </section>
  )
}, 'QuestionsPage')

export default QuestionsPage
