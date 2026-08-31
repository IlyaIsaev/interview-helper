import { action, reatomRoute, urlAtom, wrap } from "@reatom/core";
import { lazy, Suspense } from "react";

import {
  initQuestion,
  initQuestionList,
  questionList,
  resetQuestionList,
} from "@/entities/question";
import { clientApi } from "@/shared/api";
import { session } from "@/shared/auth";
import {
  PROFILE_PATH,
  QUESTIONS_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
} from "@/shared/config";
import { Spinner } from "@/shared/ui";

const HomeLayout = lazy(() => import("@/pages/home/layout/ui/layout"));

const QuestionsPage = lazy(() => import("@/pages/home/questions/index/ui/questions-page"));

const QuestionPage = lazy(() => import("@/pages/home/questions/question/index/ui/question-page"));

const SignInPage = lazy(() => import("@/pages/sign-in/index/ui/sign-in-page"));

const SignUpPage = lazy(() => import("@/pages/sign-up/index/ui/sign-up-page"));

const ProfilePage = lazy(() => import("@/pages/profile/index/ui/profile-page"));

const QUESTION_PAGE_PATH = new RegExp(`^${QUESTIONS_PATH}/[^/]+$`);

function PageFallback() {
  return (
    <section className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
      <span className="sr-only">loading</span>
    </section>
  );
}

const openSignedInDestination = action(() => {
  const questions = questionList();

  if (questions === null) {
    return;
  }

  const { pathname } = urlAtom();

  if (pathname === PROFILE_PATH) {
    return;
  }

  if (questions.length === 0 && pathname !== QUESTIONS_PATH) {
    questionsRoute.go(undefined, true);
  }

  if (questions.length === 0 && pathname === QUESTIONS_PATH) {
    return;
  }

  if (QUESTION_PAGE_PATH.test(pathname)) {
    return;
  }

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  if (!randomQuestion) {
    return;
  }

  questionRoute.go({ id: randomQuestion.id }, true);
}, "openSignedInDestination");

export const rootRoute = reatomRoute(
  {
    layout: true,
    render({ outlet }) {
      return <Suspense fallback={<PageFallback />}>{outlet()}</Suspense>;
    },
  },
  "rootRoute",
);

export const protectedRoute = rootRoute.reatomRoute(
  {
    layout: true,
    params() {
      const { pathname } = urlAtom();
      const onAuthPage = pathname === SIGN_IN_PATH || pathname === SIGN_UP_PATH;

      if (!session.ready() && onAuthPage) {
        return null;
      }

      if (!session.ready() && !onAuthPage) {
        return {};
      }

      const user = session.data()?.user;

      if (!user && questionList() !== null) {
        resetQuestionList();
      }

      if (!user && !onAuthPage) {
        signInRoute.go(undefined, true);
      }

      if (!user) {
        return null;
      }

      questionList();
      openSignedInDestination();

      return {};
    },
    async loader() {
      if (!session.data()?.user) {
        return;
      }

      const { questions } = await wrap(clientApi.loadQuestions());

      initQuestionList(questions);
    },
    render(self) {
      if (!session.ready()) {
        return <PageFallback />;
      }

      if (session.data()?.user && (!self.loader.ready() || questionList() === null)) {
        return <PageFallback />;
      }

      return <>{self.outlet()}</>;
    },
  },
  "protectedRoute",
);

export const homeRoute = protectedRoute.reatomRoute(
  {
    layout: true,
    path: "",
    params() {
      const { pathname } = urlAtom();

      if (pathname === SIGN_IN_PATH || pathname === SIGN_UP_PATH || pathname === PROFILE_PATH) {
        return null;
      }

      return {};
    },
    render({ outlet }) {
      const child = outlet();

      return (
        <HomeLayout>
          {child.length > 0 ? <Suspense fallback={<PageFallback />}>{child}</Suspense> : undefined}
        </HomeLayout>
      );
    },
  },
  "homeRoute",
);

export const questionsRoute = homeRoute.reatomRoute(
  {
    path: QUESTIONS_PATH.slice(1),
    render() {
      return <QuestionsPage />;
    },
  },
  "questionsRoute",
);

export const questionRoute = questionsRoute.reatomRoute(
  {
    path: ":id",
    params({ id }) {
      if (!session.ready() || !session.data()?.user) {

        return null;
      }

      return { id };
    },
    async loader({ id }) {
      const question = await wrap(clientApi.loadQuestion(id));

      initQuestion(question);
    },
    render(self) {
      if (!self.loader.ready()) {
        return <PageFallback />;
      }

      return <QuestionPage />;
    },
  },
  "questionRoute",
);

export const profileRoute = protectedRoute.reatomRoute(
  {
    path: PROFILE_PATH.slice(1),
    async loader() {
      const user = session.data()?.user;

      if (!user) {
        return null;
      }

      return {
        name: user.name,
        email: user.email,
      };
    },
    render(self) {
      if (!self.loader.ready()) {
        return <PageFallback />;
      }

      const user = self.loader.data();

      if (!user) {
        return <PageFallback />;
      }

      return <ProfilePage user={user} />;
    },
  },
  "profileRoute",
);

export const signInRoute = rootRoute.reatomRoute(
  {
    path: SIGN_IN_PATH.slice(1),
    params() {
      if (!session.ready()) {
        return {};
      }

      if (session.data()?.user) {
        return null;
      }

      return {};
    },
    render() {
      return <SignInPage />;
    },
  },
  "signInRoute",
);

export const signUpRoute = rootRoute.reatomRoute(
  {
    path: SIGN_UP_PATH.slice(1),
    params() {
      if (!session.ready()) {
        return {};
      }

      if (session.data()?.user) {
        return null;
      }

      return {};
    },
    render() {
      return <SignUpPage />;
    },
  },
  "signUpRoute",
);

export const appRoutes = {
  root: rootRoute,
  protected: protectedRoute,
  home: homeRoute,
  questions: questionsRoute,
  question: questionRoute,
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
};
