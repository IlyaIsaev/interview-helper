import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

import {
  closeDeleteUserDialog,
  deleteUser,
  isDeleteUserDialogOpen,
} from '../model/delete-user'

export const DeleteUser = reatomComponent(() => {
  const isDialogOpen = isDeleteUserDialogOpen()
  const isDeleteReady = deleteUser.ready()
  const handleDialogOpenChange = wrap((shouldOpen: boolean) => {
    if (shouldOpen) {
      isDeleteUserDialogOpen.setTrue()

      return
    }

    closeDeleteUserDialog()
  })
  const handleDeleteUser = wrap(deleteUser)

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xs uppercase tracking-[1.5px]">
            Delete account
          </DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            This deletes your account and all of your questions. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={wrap(closeDeleteUserDialog)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isDeleteReady}
            onClick={handleDeleteUser}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}, 'DeleteUser')
