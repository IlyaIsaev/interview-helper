import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { session, signOut } from '@/shared/auth'
import { signInPath, signUpPath } from '@/shared/config'
import { Button } from '@/shared/ui'

export const HomePage = reatomComponent(() => {
  const currentSession = session.data()
  const isSessionReady = session.ready()

  if (!isSessionReady) {
    return (
      <section className="px-4 py-16">
        <p className="text-label uppercase tracking-wider text-muted-foreground">
          loading session
        </p>
      </section>
    )
  }

  if (currentSession?.user) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          signed in
        </p>
        <h1 className="text-heading font-medium tracking-tight">
          {currentSession.user.name}
        </h1>
        <p className="text-ui text-muted-foreground">{currentSession.user.email}</p>
        <Button
          type="button"
          variant="outline"
          onClick={wrap(signOut)}
          disabled={!signOut.ready()}
        >
          Sign out
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        welcome
      </p>
      <h1 className="text-heading font-medium tracking-tight">Interview helper</h1>
      <p className="text-ui text-muted-foreground">Sign in to continue.</p>
      <div className="flex gap-2">
        <Button asChild>
          <a href={signInPath}>Sign in</a>
        </Button>
        <Button asChild variant="outline">
          <a href={signUpPath}>Sign up</a>
        </Button>
      </div>
    </section>
  )
}, 'HomePage')
