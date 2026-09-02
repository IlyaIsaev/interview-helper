import { reatomComponent } from '@reatom/react'

import { question } from '@/entities/question'

import { ShowAnswer } from './show-answer'

const QuestionPage = reatomComponent(() => {
  const openedQuestion = question()

  if (!openedQuestion) {
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
        {openedQuestion.question}
      </h1>
      <ShowAnswer answer={openedQuestion.answer} />
    </section>
  )
}, 'QuestionPage')

export default QuestionPage
