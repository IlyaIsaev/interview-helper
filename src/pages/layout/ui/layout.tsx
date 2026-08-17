import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Children, type ReactNode } from 'react'

import { ThemeSwitcher } from '@/features/theme-switcher'
import { UserMenu } from '@/widgets/user-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/ui'

import { isSidebarOpen } from '../model/layout'

type LayoutProps = {
  children: ReactNode
}

const Layout = reatomComponent(({ children }: LayoutProps) => {
  const isOpen = isSidebarOpen()
  const changeSidebarOpen = wrap((isNextOpen: boolean) => {
    isSidebarOpen.set(isNextOpen)
  })

  return (
    <SidebarProvider open={isOpen} onOpenChange={changeSidebarOpen}>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <p className="px-2 text-xs uppercase tracking-[2px] text-muted-foreground">
            Interview helper
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase tracking-[1.5px]">
              menu
            </SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b border-border px-3">
          <SidebarTrigger />
          <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
            Interview helper
          </p>
          <div className="ml-auto flex items-center gap-3">
            <UserMenu />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="min-w-0 flex-1">{Children.toArray(children)}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}, 'Layout')

export default Layout
