import { action, reatomBoolean, urlAtom, withAsync, wrap } from '@reatom/core'

import { clientApi } from '@/shared/api'
import { createdDemoUser, demoCredentials, session } from '@/shared/auth'
import { SIGN_IN_PATH } from '@/shared/config'
import { toast } from '@/shared/ui'

export const isDeleteUserDialogOpen = reatomBoolean(
  false,
  'isDeleteUserDialogOpen',
)

export const openDeleteUser = isDeleteUserDialogOpen.setTrue

export const closeDeleteUserDialog = isDeleteUserDialogOpen.setFalse

export const deleteUser = action(async () => {
  try {
    await wrap(clientApi.deleteUser())
  } catch {
    toast.error('Could not delete the account. Try again later.')

    return
  }

  closeDeleteUserDialog()
  createdDemoUser.set(null)
  await wrap(demoCredentials.retry())
  await wrap(session.retry())
  urlAtom.go(SIGN_IN_PATH)
}, 'deleteUser').extend(withAsync())
