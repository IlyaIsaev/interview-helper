import { reatomComponent } from '@reatom/react'

import { CreateQuestion } from '@/features/questions/create-question'

import '../model/questions'

const QuestionsPage = reatomComponent(() => {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        questions
      </p>
      <h1 className="text-heading font-medium tracking-tight">Questions</h1>
      <CreateQuestion />
    </section>
  )
}, 'QuestionsPage')

export default QuestionsPage
