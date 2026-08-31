import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import type { ReactNode } from 'react'

import { SidebarProvider } from '@/shared/ui'

import { isSidebarOpen } from '../model/toggle-sidebar'

type ToggleSidebarProviderProps = {
  children: ReactNode
}

export const ToggleSidebarProvider = reatomComponent(
  ({ children }: ToggleSidebarProviderProps) => {
    const isOpen = isSidebarOpen()
    const changeSidebarOpen = wrap((isNextOpen: boolean) => {
      isSidebarOpen.set(isNextOpen)
    })

    return (
      <SidebarProvider open={isOpen} onOpenChange={changeSidebarOpen}>
        {children}
      </SidebarProvider>
    )
  },
  'ToggleSidebarProvider',
)
