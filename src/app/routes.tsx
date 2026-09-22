import { action, atom, reatomRoute, urlAtom, wrap } from "@reatom/core";
import { pipe, sample } from "es-toolkit/fp";
import { lazy, Suspense } from "react";
import * as v from "valibot";

import { questions, resetQuestions } from "@/entities/questions/question/model/questions";
import { clientApi } from "@/shared/api";
import { session } from "@/shared/auth";
import {
  HOME_PATH,
  PROFILE_PATH,
  QUESTIONS_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  THEORY_PATH,
} from "@/shared/config";
import { PageFallback, RouteLoadError } from "@/shared/ui";

const QuestionsLayout = lazy(() => import("@/pages/questions/layout/ui/layout"));

const QuestionsPage = lazy(() => import("@/pages/questions/index/ui/questions-page"));

const QuestionPage = lazy(() => import("@/pages/questions/question/index/ui/question-page"));

const SignInPage = lazy(() => import("@/pages/sign-in/index/ui/sign-in-page"));

const SignUpPage = lazy(() => import("@/pages/sign-up/index/ui/sign-up-page"));

const ProfilePage = lazy(() => import("@/pages/profile/index/ui/profile-page"));

const TheoryPage = lazy(() => import("@/pages/theory/index/ui/theory-page"));

const QUESTION_PAGE_PATH = new RegExp(`^${QUESTIONS_PATH}/[^/]+$`);

const questionParamsSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
});

const theoryOpenedSearchSchema = v.object({
  id: v.optional(v.string()),
});

const lastQuestionsUserId = atom<string | null | undefined>(undefined, "lastQuestionsUserId");

const openSignedInDestination = action(() => {
  const listedQuestions = questions.data();

  if (listedQuestions === null) return;

  const { pathname } = urlAtom();

  if (QUESTION_PAGE_PATH.test(pathname)) return;

  if (listedQuestions.length === 0) return;

  const nextQuestion = pipe(listedQuestions, sample());

  if (!nextQuestion) return;

  questionRoute.go({ id: nextQuestion.id }, true);
}, "openSignedInDestination");

export const openQuestion = action((questionId: string) => {
  if (urlAtom().pathname === THEORY_PATH) {
    theoryOpenedRoute.go({ id: questionId });

    return;
  }

  questionRoute.go({ id: questionId });
}, "openQuestion");

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

      if (!session.ready() && onAuthPage) return null;

      if (!session.ready()) return {};

      const user = session.data()?.user;
      const userId = user?.id ?? null;

      if (lastQuestionsUserId() !== userId) {
        const previousUserId = lastQuestionsUserId();

        lastQuestionsUserId.set(userId);

        if (previousUserId !== undefined && questions.data() !== null) {
          resetQuestions();

          if (pathname === THEORY_PATH) theoryOpenedRoute.go({}, true);
        }
      }

      if (!user && onAuthPage) return null;

      if (pathname === HOME_PATH || (user && onAuthPage)) {
        questionsRoute.go(undefined, true);

        return null;
      }

      return { userId };
    },
    render(self) {
      if (!session.ready()) return <PageFallback />;

      return <>{self.outlet()}</>;
    },
  },
  "protectedRoute",
);

export const questionsRoute = protectedRoute.reatomRoute(
  {
    layout: true,
    path: QUESTIONS_PATH.slice(1),
    params() {
      const { pathname } = urlAtom();

      if (pathname === QUESTIONS_PATH || QUESTION_PAGE_PATH.test(pathname)) {
        openSignedInDestination();
      }

      return {};
    },
    async loader() {
      if (!session.ready()) return;

      await wrap(questions());

      openSignedInDestination();
    },
    render(self) {
      const loadError = questions.error();

      if (loadError) return <RouteLoadError onRetry={wrap(() => questions.retry())} />;

      if (!questions.ready() || questions.data() === null) return <PageFallback />;

      const child = self.outlet();

      return (
        <QuestionsLayout>
          <Suspense fallback={<PageFallback />}>
            {child.length > 0 ? child : <QuestionsPage />}
          </Suspense>
        </QuestionsLayout>
      );
    },
  },
  "questionsRoute",
);

export const questionRoute = questionsRoute.reatomRoute(
  {
    path: ":id",
    params: questionParamsSchema,
    async loader({ id }) {
      if (!session.ready()) return null;

      const loadedQuestion = await wrap(clientApi.loadQuestion(id));

      if (!loadedQuestion) {
        questionsRoute.go(undefined, true);

        return null;
      }

      return loadedQuestion;
    },
    render(self) {
      const loadError = self.loader.error();

      if (loadError) {
        return <RouteLoadError onRetry={wrap(() => self.loader.retry())} />;
      }

      if (!self.loader.data()) return <PageFallback />;

      return <QuestionPage />;
    },
  },
  "questionRoute",
);

export const theoryRoute = protectedRoute.reatomRoute(
  {
    layout: true,
    path: THEORY_PATH.slice(1),
    async loader() {
      if (!session.ready()) return;

      await wrap(questions());
    },
    render(self) {
      const loadError = questions.error();

      if (loadError) return <RouteLoadError onRetry={wrap(() => questions.retry())} />;

      if (!questions.ready() || questions.data() === null) return <PageFallback />;

      return <>{self.outlet()}</>;
    },
  },
  "theoryRoute",
);

export const theoryOpenedRoute = theoryRoute.reatomRoute(
  {
    search: theoryOpenedSearchSchema,
    async loader({ id }) {
      if (!id) return null;

      if (!session.ready()) return null;

      return await wrap(clientApi.loadQuestion(id));
    },
    render() {
      return <TheoryPage />;
    },
  },
  "theoryOpenedRoute",
);

export const profileRoute = protectedRoute.reatomRoute(
  {
    path: PROFILE_PATH.slice(1),
    params() {
      if (!session.ready()) return {};

      if (!session.data()?.user) {
        signInRoute.go(undefined, true);

        return null;
      }

      return {};
    },
    async loader() {
      const user = session.data()?.user;

      if (!user) return null;

      return {
        name: user.name,
        email: user.email,
      };
    },
    render(self) {
      const loadError = self.loader.error();

      if (loadError) return <RouteLoadError onRetry={wrap(() => self.loader.retry())} />;

      if (!self.loader.ready()) return <PageFallback />;

      const user = self.loader.data();

      if (!user) return <PageFallback />;

      return <ProfilePage user={user} />;
    },
  },
  "profileRoute",
);

export const signInRoute = rootRoute.reatomRoute(
  {
    path: SIGN_IN_PATH.slice(1),
    params() {
      if (!session.ready()) return {};

      if (session.data()?.user) return null;

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
      if (!session.ready()) return {};

      if (session.data()?.user) return null;

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
  questions: questionsRoute,
  question: questionRoute,
  theory: theoryRoute,
  theoryOpened: theoryOpenedRoute,
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
};
