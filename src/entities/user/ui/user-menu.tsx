import type { ReactNode } from 'react'

import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui'

import type { User } from '../model/user'

type UserMenuProps = {
  user: User
  profileAction: ReactNode
  signOutAction: ReactNode
}

function UserMenu({ user, profileAction, signOutAction }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar>
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {profileAction}
        {signOutAction}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }

export type { UserMenuProps }
