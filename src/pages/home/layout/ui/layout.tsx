import { Children, type ReactNode } from 'react'

import { CreateQuestion } from '@/features/questions/create-question'
import { DeleteQuestion } from '@/features/questions/delete-question'
import { UpdateQuestion } from '@/features/questions/update-question'
import { ThemeSwitcher } from '@/features/theme-switcher'
import { UserMenu } from '@/features/user-menu'
import { HOME_PATH } from '@/shared/config'
import { SidebarInset, SidebarTrigger } from '@/shared/ui'

import HomePage from './home-page'
import { QuestionsSidebar } from './questions-sidebar'
import { ToggleSidebarProvider } from './toggle-sidebar-provider'

type LayoutProps = {
  children?: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <ToggleSidebarProvider>
      <QuestionsSidebar />
      <CreateQuestion />
      <UpdateQuestion />
      <DeleteQuestion />
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b border-border px-3">
          <SidebarTrigger />
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
        <div className="min-w-0 flex-1">
          {Children.count(children) === 0 ? <HomePage /> : Children.toArray(children)}
        </div>
      </SidebarInset>
    </ToggleSidebarProvider>
  )
}

export default Layout
