import { action, reatomRoute, urlAtom, wrap } from '@reatom/core'
import { lazy, Suspense } from 'react'

import { initQuestion } from '@/entities/questions/question'
import { initQuestionList, questionList } from '@/entities/questions/sidebar'
import { clientApi } from '@/shared/api'
import { session } from '@/shared/auth'
import {
  profilePath,
  questionPath,
  questionsPath,
  signInPath,
  signUpPath,
} from '@/shared/config'
import { Spinner } from '@/shared/ui'

const HomeLayout = lazy(() => import('@/pages/home/layout/ui/layout'))

const QuestionsPage = lazy(
  () => import('@/pages/home/questions/index/ui/questions-page'),
)

const QuestionPage = lazy(
  () => import('@/pages/home/questions/question/index/ui/question-page'),
)

const SignInPage = lazy(() => import('@/pages/sign-in/index/ui/sign-in-page'))

const SignUpPage = lazy(() => import('@/pages/sign-up/index/ui/sign-up-page'))

const ProfilePage = lazy(() => import('@/pages/profile/index/ui/profile-page'))

const questionPagePath = new RegExp(`^${questionsPath}/[^/]+$`)

function PageFallback() {
  return (
    <section className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
      <span className="sr-only">loading</span>
    </section>
  )
}

const isAuthPath = (pathname: string) => {
  return pathname === signInPath || pathname === signUpPath
}

const openSignedInDestination = action(() => {
  const questions = questionList()

  if (questions === null) {
    return
  }

  const { pathname } = urlAtom()

  if (pathname === profilePath) {
    return
  }

  if (questions.length === 0) {
    if (pathname !== questionsPath) {
      urlAtom.go(questionsPath, true)
    }

    return
  }

  if (questionPagePath.test(pathname)) {
    return
  }

  const randomQuestion =
    questions[Math.floor(Math.random() * questions.length)]

  if (!randomQuestion) {
    return
  }

  urlAtom.go(questionPath(randomQuestion.id), true)
}, 'openSignedInDestination')

export const rootRoute = reatomRoute(
  {
    layout: true,
    render({ outlet }) {
      return <Suspense fallback={<PageFallback />}>{outlet()}</Suspense>
    },
  },
  'rootRoute',
)

export const protectedRoute = rootRoute.reatomRoute(
  {
    layout: true,
    params() {
      const { pathname } = urlAtom()
      const onAuthPage = isAuthPath(pathname)

      if (!session.ready()) {
        if (onAuthPage) {
          return null
        }

        return {}
      }

      const user = session.data()?.user

      if (!user) {
        if (questionList() !== null) {
          questionList.set(null)
        }

        if (!onAuthPage) {
          urlAtom.go(signInPath, true)
        }

        return null
      }

      questionList()
      openSignedInDestination()

      return {}
    },
    async loader() {
      if (!session.data()?.user) {
        return
      }

      const { questions } = await wrap(clientApi.loadQuestions())

      initQuestionList(questions)
    },
    render(protectedPage) {
      if (!session.ready()) {
        return <PageFallback />
      }

      if (session.data()?.user) {
        if (!protectedPage.loader.ready() || questionList() === null) {
          return <PageFallback />
        }
      }

      return <>{protectedPage.outlet()}</>
    },
  },
  'protectedRoute',
)

export const homeRoute = protectedRoute.reatomRoute(
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

      return {}
    },
    render({ outlet }) {
      const child = outlet()

      return (
        <HomeLayout>
          {child.length > 0 ? (
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
      const question = await wrap(clientApi.loadQuestion(id))

      initQuestion(question)
    },
    render(question) {
      if (!question.loader.ready()) {
        return <PageFallback />
      }

      return <QuestionPage />
    },
  },
  'questionRoute',
)

export const profileRoute = protectedRoute.reatomRoute(
  {
    path: profilePath.slice(1),
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

      if (session.data()?.user) {
        return null
      }

      return {}
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
    params() {
      if (!session.ready()) {
        return {}
      }

      if (session.data()?.user) {
        return null
      }

      return {}
    },
    render() {
      return <SignUpPage />
    },
  },
  'signUpRoute',
)

export const appRoutes = {
  root: rootRoute,
  protected: protectedRoute,
  home: homeRoute,
  questions: questionsRoute,
  question: questionRoute,
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
}
