import { reatomComponent } from '@reatom/react'

const HomePage = reatomComponent(() => {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        home
      </p>
      <h1 className="text-heading font-medium tracking-tight">Home</h1>
    </section>
  )
}, 'HomePage')

export default HomePage
