import { reatomComponent } from '@reatom/react'
import { House } from 'lucide-react'

import { ThemeSwitcher } from '@/features/theme-switcher'
import { UserMenu } from '@/features/user-menu'
import { HOME_PATH } from '@/shared/config'
import { Button } from '@/shared/ui'

type ProfilePageProps = {
  user: {
    name: string
    email: string
  }
}

const ProfilePage = reatomComponent(({ user }: ProfilePageProps) => {
  return (
    <>
      <header className="flex h-12 items-center gap-3 border-b border-border px-3">
        <Button asChild className="size-7" size="icon" variant="ghost">
          <a aria-label="Home" href={HOME_PATH}>
            <House />
          </a>
        </Button>
        <a
          className="text-sm uppercase tracking-[2px] text-muted-foreground"
          href={HOME_PATH}
        >
          Interview helper
        </a>
        <div className="ml-auto flex items-center gap-3">
          <UserMenu />
          <ThemeSwitcher />
        </div>
      </header>
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          profile
        </p>
        <h1 className="text-heading font-medium tracking-tight">{user.name}</h1>
        <p className="text-ui text-muted-foreground">{user.email}</p>
      </section>
    </>
  )
}, 'ProfilePage')

export default ProfilePage
