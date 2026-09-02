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

import { user } from '../model/user'

export const UserMenu = reatomComponent(() => {
  const { name, initials } = user() ?? { name: '', initials: '' }
  const handleLogOut = wrap(signOut)

  if (!name) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={PROFILE_PATH}>Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!signOut.ready()} onClick={handleLogOut}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}, 'UserMenu')
