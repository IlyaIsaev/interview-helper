import { reatomComponent } from '@reatom/react'

const QuestionPage = reatomComponent(() => {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        question
      </p>
      <h1 className="text-heading font-medium tracking-tight">Question</h1>
    </section>
  )
}, 'QuestionPage')

export default QuestionPage
