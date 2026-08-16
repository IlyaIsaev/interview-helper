import { reatomRoute } from '@reatom/core'

import { HomePage } from '@/pages/home'
import { SignInPage } from '@/pages/sign-in'
import { SignUpPage } from '@/pages/sign-up'
import { signInPath, signUpPath } from '@/shared/config'

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

export const signInRoute = layoutRoute.reatomRoute(
  {
    path: signInPath.slice(1),
    render() {
      return <SignInPage />
    },
  },
  'signInRoute',
)

export const signUpRoute = layoutRoute.reatomRoute(
  {
    path: signUpPath.slice(1),
    render() {
      return <SignUpPage />
    },
  },
  'signUpRoute',
)

export const appRoutes = {
  layout: layoutRoute,
  home: homeRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
}
