import { action, effect, reatomRoute, urlAtom, wrap } from "@reatom/core";
import { pipe, sample } from "es-toolkit/fp";
import { lazy, Suspense } from "react";

import {
  initQuestion,
  initQuestions,
  openedQuestionId,
  questions,
  questionsQuery,
  resetQuestions,
} from "@/entities/questions/question";
import { questionSearch } from "@/pages/questions/layout/model/question-search";
import { loadOpenedQuestion } from "@/pages/theory/index/model/load-opened-question";
import { theoryQuestionSearch } from "@/pages/theory/index/model/question-search";
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
import { PageFallback } from "@/shared/ui";

const QuestionsLayout = lazy(() => import("@/pages/questions/layout/ui/layout"));

const QuestionsPage = lazy(() => import("@/pages/questions/index/ui/questions-page"));

const QuestionPage = lazy(() => import("@/pages/questions/question/index/ui/question-page"));

const SignInPage = lazy(() => import("@/pages/sign-in/index/ui/sign-in-page"));

const SignUpPage = lazy(() => import("@/pages/sign-up/index/ui/sign-up-page"));

const ProfilePage = lazy(() => import("@/pages/profile/index/ui/profile-page"));

const TheoryPage = lazy(() => import("@/pages/theory/index/ui/theory-page"));

const QUESTION_PAGE_PATH = new RegExp(`^${QUESTIONS_PATH}/[^/]+$`);

const openSignedInDestination = action(() => {
  if (questions() === null) return;

  const { pathname } = urlAtom();

  if (QUESTION_PAGE_PATH.test(pathname)) return;

  if (questions()?.length === 0) return;

  const question = pipe(questions() ?? [], sample());

  if (!question) return;

  questionRoute.go({ id: question.id }, true);
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

      if (!session.ready() && onAuthPage) return null;

      if (!session.ready() && !onAuthPage) return {};

      const user = session.data()?.user;

      if (!user && questions() !== null) {
        resetQuestions();

        questionSearch.reset();

        theoryQuestionSearch.reset();
      }

      if (!user && !onAuthPage) {
        signInRoute.go(undefined, true);

        return null;
      }

      if (!user && onAuthPage) return null;

      if (pathname === HOME_PATH || onAuthPage) {
        questionsRoute.go(undefined, true);

        return null;
      }

      return {};
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
      openSignedInDestination();

      return {};
    },
    async loader() {
      if (!session.data()?.user) return;

      questionsQuery.set(questionSearch().trim());

      const { questions: nextQuestions } = await wrap(
        clientApi.loadQuestions(questionsQuery()),
      );

      initQuestions(nextQuestions);

      openSignedInDestination();
    },
    render(self) {
      self.loader.ready();

      if (questions() === null) return <PageFallback />;

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
    params({ id }) {
      if (!session.ready() || !session.data()?.user) return null;

      return { id };
    },
    async loader({ id }) {
      const question = await wrap(clientApi.loadQuestion(id));

      initQuestion(question);
    },
    render(self) {
      if (!self.loader.ready()) return <PageFallback />;

      return <QuestionPage />;
    },
  },
  "questionRoute",
);

export const theoryRoute = protectedRoute.reatomRoute(
  {
    path: THEORY_PATH.slice(1),
    async loader() {
      if (!session.data()?.user) return;

      const idFromUrl = urlAtom().searchParams.get("id") ?? "";

      if (openedQuestionId() !== idFromUrl) {
        openedQuestionId.set(idFromUrl);
      }

      questionsQuery.set(theoryQuestionSearch().trim());

      const { questions: nextQuestions } = await wrap(
        clientApi.loadQuestions(questionsQuery()),
      );

      initQuestions(nextQuestions);

      effect(() => {
        loadOpenedQuestion(openedQuestionId());
      });
    },
    render(self) {
      self.loader.ready();

      if (questions() === null) return <PageFallback />;

      return <TheoryPage />;
    },
  },
  "theoryRoute",
);

export const profileRoute = protectedRoute.reatomRoute(
  {
    path: PROFILE_PATH.slice(1),
    async loader() {
      const user = session.data()?.user;

      if (!user) return null;

      return {
        name: user.name,
        email: user.email,
      };
    },
    render(self) {
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
  profile: profileRoute,
  signIn: signInRoute,
  signUp: signUpRoute,
};
