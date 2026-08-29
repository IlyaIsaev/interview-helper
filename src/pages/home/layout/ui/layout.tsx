import { Children, type ReactNode } from 'react'

import { CreateQuestion } from '@/features/questions/create-question'
import {
  ToggleSidebar,
  ToggleSidebarProvider,
} from '@/features/questions/toggle-sidebar'
import { UpdateQuestion } from '@/features/questions/update-question'
import { ThemeSwitcher } from '@/features/theme-switcher'
import { QuestionsSidebar } from '@/widgets/questions-sidebar'
import { UserMenu } from '@/widgets/user-menu'
import { homePath } from '@/shared/config'
import { SidebarInset } from '@/shared/ui'

import '../model/layout'
import HomePage from './home-page'

type LayoutProps = {
  children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ToggleSidebarProvider>
      <QuestionsSidebar />
      <CreateQuestion />
      <UpdateQuestion />
      <SidebarInset>
        <header className="flex h-12 items-center gap-3 border-b border-border px-3">
          <ToggleSidebar />
          <a
            className="text-sm uppercase tracking-[2px] text-muted-foreground"
            href={homePath}
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
