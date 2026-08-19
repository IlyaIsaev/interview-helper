import { reatomComponent } from '@reatom/react'

import { currentQuestion } from '@/entities/questions/question'

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
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        answer
      </p>
      <p className="text-ui text-muted-foreground">{question.answer}</p>
    </section>
  )
}, 'QuestionPage')

export default QuestionPage
