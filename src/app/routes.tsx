import { reatomRoute, urlAtom } from '@reatom/core'
import { lazy, Suspense } from 'react'

import { session } from '@/shared/auth'
import { Spinner } from '@/shared/ui'
import {
  homePath,
  profilePath,
  questionsPath,
  signInPath,
  signUpPath,
} from '@/shared/config'

const Layout = lazy(() => import('@/pages/layout'))

const HomePage = lazy(() => import('@/pages/home'))

const QuestionsPage = lazy(() => import('@/pages/questions'))

const QuestionPage = lazy(() => import('@/pages/question'))

const SignInPage = lazy(() => import('@/pages/sign-in'))

const SignUpPage = lazy(() => import('@/pages/sign-up'))

const ProfilePage = lazy(() => import('@/pages/profile'))

function PageFallback() {
  return (
    <section className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
      <span className="sr-only">loading</span>
    </section>
  )
}

export const rootRoute = reatomRoute(
  {
    layout: true,
    render({ outlet }) {
      return <Suspense fallback={<PageFallback />}>{outlet()}</Suspense>
    },
  },
  'rootRoute',
)

export const layoutRoute = rootRoute.reatomRoute(
  {
    layout: true,
    params() {
      const { pathname } = urlAtom()

      if (
        pathname === signInPath ||
        pathname === signUpPath ||
        pathname === profilePath
      ) {
        return null
      }

      return {}
    },
    render({ outlet }) {
      return <Layout>{outlet()}</Layout>
    },
  },
  'layoutRoute',
)

export const homeRoute = layoutRoute.reatomRoute(
  {
    path: '',
    params() {
      if (!session.ready()) {
        return {}
      }

      if (session.data()?.user) {
        return {}
      }

      urlAtom.go(signInPath, true)

      return null
    },
    render() {
      return <HomePage />
    },
  },
  'homeRoute',
)

export const questionsRoute = homeRoute.reatomRoute(
  {
    path: questionsPath.slice(1),
    render() {
      return <QuestionsPage />
    },
  },
  'questionsRoute',
)

export const questionRoute = questionsRoute.reatomRoute(
  {
    path: ':id',
    render() {
      return <QuestionPage />
    },
  },
  'questionRoute',
)

export const profileRoute = rootRoute.reatomRoute(
  {
    path: profilePath.slice(1),
    params() {
      if (!session.ready()) {
        return {}
      }

      if (session.data()?.user) {
        return {}
      }

      urlAtom.go(signInPath, true)

      return null
    },
    async loader() {
      const user = session.data()?.user

      if (!user) {
        return null
      }

      return {
        name: user.name,
        email: user.email,
      }
    },
    render(profile) {
      if (!profile.loader.ready()) {
        return <PageFallback />
      }

      const user = profile.loader.data()

      if (!user) {
        return <PageFallback />
      }

      return <ProfilePage user={user} />
    },
  },
  'profileRoute',
)

export const signInRoute = rootRoute.reatomRoute(
  {
    path: signInPath.slice(1),
    params() {
      if (!session.ready()) {
        return {}
      }

      if (!session.data()?.user) {
        return {}
      }

      urlAtom.go(homePath, true)

      return null
    },
    render() {
      return <SignInPage />
    },
  },
  'signInRoute',
)

export const signUpRoute = rootRoute.reatomRoute(
  {
    path: signUpPath.slice(1),
    render() {
      return <SignUpPage />
    },
  },
  'signUpRoute',
)

export const appRoutes = {
  root: rootRoute,
  layout: layoutRoute,
  home: homeRoute,
  questions: questionsRoute,
  question: questionRoute,
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
}
