import { reatomComponent } from '@reatom/react'

import { currentQuestion } from '@/entities/questions/question'
import { ShowAnswer } from '@/features/questions/show-answer'

const QuestionPage = reatomComponent(() => {
  const question = currentQuestion()

  if (!question) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          question not found
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        question
      </p>
      <h1 className="text-heading font-medium tracking-tight">
        {question.question}
      </h1>
      <ShowAnswer answer={question.answer} />
    </section>
  )
}, 'QuestionPage')

export default QuestionPage
