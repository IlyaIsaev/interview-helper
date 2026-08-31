import { reatomComponent } from '@reatom/react'

import { theme } from '@/shared/theme'
import { Toaster } from '@/shared/ui'

import { appRoutes } from './routes'

export const App = reatomComponent(() => {
  return (
    <>
      {appRoutes.root.render()}
      <Toaster theme={theme()} />
    </>
  )
}, 'App')
