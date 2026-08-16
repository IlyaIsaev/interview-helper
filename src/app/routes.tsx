import { reatomRoute } from '@reatom/core'

import { HomePage } from '@/pages/home'

export const layoutRoute = reatomRoute(
  {
    layout: true,
    render({ outlet }) {
      return <>{outlet()}</>
    },
  },
  'layoutRoute',
)

export const homeRoute = layoutRoute.reatomRoute(
  {
    path: '',
    render() {
      return <HomePage />
    },
  },
  'homeRoute',
)

export const appRoutes = {
  layout: layoutRoute,
  home: homeRoute,
}
