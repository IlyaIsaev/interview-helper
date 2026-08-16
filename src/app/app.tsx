import { reatomComponent } from '@reatom/react'

import { appRoutes } from './routes'

export const App = reatomComponent(() => {
  return appRoutes.layout.render()
}, 'App')
