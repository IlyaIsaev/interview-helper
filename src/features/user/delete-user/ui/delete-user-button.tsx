import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { Button } from '@/shared/ui'

import { openDeleteUser } from '../model/delete-user'

export const DeleteUserButton = reatomComponent(() => {
  const handleOpenDeleteUser = wrap(openDeleteUser)

  return (
    <Button type="button" variant="destructive" onClick={handleOpenDeleteUser}>
      Delete account
    </Button>
  )
}, 'DeleteUserButton')
