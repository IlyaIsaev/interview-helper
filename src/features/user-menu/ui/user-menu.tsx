import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { signOut } from '@/shared/auth'
import { PROFILE_PATH } from '@/shared/config'
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

import { currentUser } from '../model/user'

export const UserMenu = reatomComponent(() => {
  const user = currentUser()
  const handleLogOut = wrap(signOut)

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar>
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={PROFILE_PATH}>{user.name}</a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!signOut.ready()} onClick={handleLogOut}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, 'UserMenu')
