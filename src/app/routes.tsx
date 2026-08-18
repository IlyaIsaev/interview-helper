import { reatomRoute, urlAtom, wrap } from '@reatom/core'
import { lazy, Suspense } from 'react'

import { loadQuestionList } from '@/entities/questions/sidebar'
import { clientApi } from '@/shared/api'
import { session } from '@/shared/auth'
import { Spinner } from '@/shared/ui'
import {
  homePath,
  profilePath,
  questionsPath,
  signInPath,
  signUpPath,
} from '@/shared/config'

const HomeLayout = lazy(() => import('@/pages/home/layout'))

const QuestionsPage = lazy(() => import('@/pages/home/questions/index'))

const QuestionPage = lazy(() => import('@/pages/home/questions/question/index'))

const SignInPage = lazy(() => import('@/pages/sign-in/index'))

const SignUpPage = lazy(() => import('@/pages/sign-up/index'))

const ProfilePage = lazy(() => import('@/pages/profile/index'))

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

export const homeRoute = rootRoute.reatomRoute(
  {
    layout: true,
    path: '',
    params() {
      const { pathname } = urlAtom()

      if (
        pathname === signInPath ||
        pathname === signUpPath ||
        pathname === profilePath
      ) {
        return null
      }

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
      return await wrap(loadQuestionList())
    },
    render({ outlet }) {
      const child = outlet()

      return (
        <HomeLayout>
          {child ? (
            <Suspense fallback={<PageFallback />}>{child}</Suspense>
          ) : undefined}
        </HomeLayout>
      )
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
    async loader({ id }) {
      return await wrap(clientApi.loadQuestion(id))
    },
    render(question) {
      if (!question.loader.ready()) {
        return <PageFallback />
      }

      return <QuestionPage question={question.loader.data() ?? null} />
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
  home: homeRoute,
  questions: questionsRoute,
  question: questionRoute,
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
}
