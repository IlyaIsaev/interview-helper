import { reatomComponent } from '@reatom/react'

import { question } from '@/entities/question'
import { cn } from '@/shared/lib'
import { Card, CardContent, Markdown } from '@/shared/ui'

import { NextQuestion } from './next-question'
import { ShowAnswer } from './show-answer'

const questionPageClassName = cn(
  'mx-auto flex h-full min-h-0 w-full max-w-[80ch] flex-1 flex-col gap-4 px-4 py-4',
)

const QuestionPage = reatomComponent(() => {
  const openedQuestion = question()

  if (!openedQuestion) {
    return (
      <section className={questionPageClassName}>
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          question not found
        </p>
      </section>
    )
  }

  return (
    <section className={questionPageClassName}>
      <Card className="shrink-0">
        <CardContent className="pt-3.5">
          <Markdown>{openedQuestion.question}</Markdown>
        </CardContent>
      </Card>
      <ShowAnswer
        key={openedQuestion.question}
        answer={openedQuestion.answer}
      />
      <NextQuestion />
    </section>
  )
}, 'QuestionPage')

export default QuestionPage
