import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { signOut } from '@/shared/auth'
import { Button } from '@/shared/ui'

import { home } from '../model/home'

export const HomePage = reatomComponent(() => {
  const screen = home()
  const handleSignOut = wrap(signOut)

  if (screen.kind === 'loading') {
    return (
      <section className="px-4 py-16">
        <p className="text-label uppercase tracking-wider text-muted-foreground">
          loading session
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
        signed in
      </p>
      <h1 className="text-heading font-medium tracking-tight">
        {screen.user.name}
      </h1>
      <p className="text-ui text-muted-foreground">{screen.user.email}</p>
      <Button
        type="button"
        variant="outline"
        onClick={handleSignOut}
        disabled={!signOut.ready()}
      >
        Sign out
      </Button>
    </section>
  )
}, 'HomePage')
