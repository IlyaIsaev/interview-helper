import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { currentUser, UserMenu as UserMenuView } from '@/entities/user'
import { signOut } from '@/shared/auth'
import { profilePath } from '@/shared/config'
import { DropdownMenuItem } from '@/shared/ui'

export const UserMenu = reatomComponent(() => {
  const user = currentUser()
  const handleLogOut = wrap(signOut)

  if (!user) {
    return null
  }

  return (
    <UserMenuView
      user={user}
      profileAction={
        <DropdownMenuItem asChild>
          <a href={profilePath}>{user.name}</a>
        </DropdownMenuItem>
      }
      signOutAction={
        <DropdownMenuItem disabled={!signOut.ready()} onClick={handleLogOut}>
          Log Out
        </DropdownMenuItem>
      }
    />
  )
}, 'UserMenu')
