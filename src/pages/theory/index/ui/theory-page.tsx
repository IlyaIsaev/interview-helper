import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { find, flatten, map, pipe } from "es-toolkit/fp";
import { House, Pencil, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";

import { questionsRoute, theoryOpenedRoute } from "@/app/routes";
import {
  openedQuestionId,
  question,
  questions,
  theoryQuestionSearch,
  type Question,
} from "@/entities/questions/question";
import {
  CreateQuestion,
  CreateQuestionButton,
  CreateQuestionEmptyButton,
} from "@/features/questions/create-question";
import { DeleteQuestion, openDeleteQuestion } from "@/features/questions/delete-question";
import { PublishQuestionsButton } from "@/features/questions/publish-questions";
import { openUpdateQuestion, UpdateQuestion } from "@/features/questions/update-question";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { UserMenu } from "@/features/user/user-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
  Label,
  Markdown,
  Spinner,
} from "@/shared/ui";

type QuestionAnswerProps = {
  questionId: string;
};

const QuestionAnswer = reatomComponent(({ questionId }: QuestionAnswerProps) => {
  const openedQuestion = question();
  const isOpenedQuestionReady = theoryOpenedRoute.loader.ready();
  const openedQuestionError = theoryOpenedRoute.loader.error();

  if (openedQuestion?.id === questionId) {
    return <Markdown>{openedQuestion.answer}</Markdown>;
  }

  if (openedQuestionError && openedQuestionId() === questionId) {
    return (
      <div className="flex flex-col items-start gap-3 py-2">
        <p className="text-ui uppercase tracking-[2px] text-muted-foreground">
          could not load this question
        </p>
        <Button type="button" onClick={wrap(() => theoryOpenedRoute.loader.retry())}>
          Retry
        </Button>
      </div>
    );
  }

  if (isOpenedQuestionReady && openedQuestionId() === questionId && openedQuestion === null) {
    return (
      <p className="text-ui uppercase tracking-[2px] text-muted-foreground">question not found</p>
    );
  }

  return (
    <div className="flex items-center justify-center py-4">
      <Spinner className="size-6" />
      <span className="sr-only">loading</span>
    </div>
  );
}, "QuestionAnswer");

type QuestionAccordionItemProps = {
  question: Question;
};

const QuestionAccordionItem = reatomComponent(
  ({ question: listedQuestion }: QuestionAccordionItemProps) => {
    const handleOpenUpdateQuestion = wrap((event: { stopPropagation: () => void }) => {
      event.stopPropagation();

      openUpdateQuestion(listedQuestion.id);
    });

    const handleOpenDeleteQuestion = wrap((event: { stopPropagation: () => void }) => {
      event.stopPropagation();

      openDeleteQuestion(listedQuestion.id);
    });

    return (
      <AccordionItem className="group/accordion-item" value={listedQuestion.id}>
        <AccordionTrigger
          className="py-3 hover:no-underline"
          trailing={
            <div className="flex shrink-0 items-center gap-1 py-2 pr-1 transition-opacity md:opacity-0 md:group-hover/accordion-item:opacity-100 md:group-focus-within/accordion-item:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Update question"
                onClick={handleOpenUpdateQuestion}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Delete question"
                onClick={handleOpenDeleteQuestion}
              >
                <Trash2 />
              </Button>
            </div>
          }
        >
          <span className="min-w-0 flex-1 text-left">
            <Markdown plain>{listedQuestion.question}</Markdown>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <QuestionAnswer questionId={listedQuestion.id} />
        </AccordionContent>
      </AccordionItem>
    );
  },
  "QuestionAccordionItem",
);

const TheoryQuestions = reatomComponent(() => {
  const listedQuestions = questions.data();
  const search = theoryQuestionSearch();
  const openedId = openedQuestionId();
  const openedQuestion = question();
  const isOpenedQuestionReady = theoryOpenedRoute.loader.ready();
  const openedQuestionError = theoryOpenedRoute.loader.error();
  const isOpenedQuestionListed =
    listedQuestions !== null &&
    pipe(
      listedQuestions,
      find((listedQuestion: Question) => listedQuestion.id === openedId),
    ) !== undefined;

  const extraOpenedQuestion =
    openedId.length > 0 && !isOpenedQuestionListed && openedQuestion?.id === openedId
      ? {
          id: openedQuestion.id,
          question: openedQuestion.question,
        }
      : null;
  const accordionQuestions = pipe(
    [listedQuestions ?? [], extraOpenedQuestion === null ? [] : [extraOpenedQuestion]],
    flatten(),
  );
  const isOpenedQuestionMissing =
    openedId.length > 0 && !isOpenedQuestionListed && extraOpenedQuestion === null;

  const changeOpenedQuestion = wrap((nextQuestionId: string) => {
    if (nextQuestionId.length === 0) {
      theoryOpenedRoute.go({});

      return;
    }

    theoryOpenedRoute.go({ id: nextQuestionId });
  });

  const changeQuestionSearch = wrap((event: ChangeEvent<HTMLInputElement>) => {
    theoryQuestionSearch.set(event.currentTarget.value);
  });

  if (listedQuestions === null) {
    return (
      <section className="flex min-h-full items-center justify-center">
        <Spinner className="size-6" />
        <span className="sr-only">loading</span>
      </section>
    );
  }

  if (listedQuestions.length === 0 && search.trim().length === 0 && openedId.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">theory</p>
        <h1 className="text-heading font-medium tracking-tight">Theory</h1>
        <p className="text-ui uppercase tracking-[2px] text-muted-foreground">
          the questions list is empty
        </p>
        <CreateQuestionEmptyButton />
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-[80ch] flex-1 flex-col gap-4 overflow-y-auto px-4 py-8">
      <p className="text-xs uppercase tracking-[2px] text-muted-foreground">theory</p>
      <h1 className="text-heading font-medium tracking-tight">Theory</h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="theory-question-search">search</Label>
        <Input
          id="theory-question-search"
          type="search"
          value={search}
          onChange={changeQuestionSearch}
        />
      </div>
      {accordionQuestions.length === 0 && !isOpenedQuestionMissing ? (
        <p className="text-ui uppercase tracking-[2px] text-muted-foreground">no matches</p>
      ) : (
        <>
          {accordionQuestions.length > 0 ? (
            <Accordion
              type="single"
              collapsible
              value={openedId}
              onValueChange={changeOpenedQuestion}
            >
              {pipe(
                accordionQuestions,
                map((listedQuestion) => (
                  <QuestionAccordionItem key={listedQuestion.id} question={listedQuestion} />
                )),
              )}
            </Accordion>
          ) : null}
          {isOpenedQuestionMissing ? (
            openedQuestionError ? (
              <div className="flex flex-col items-start gap-3 py-2">
                <p className="text-ui uppercase tracking-[2px] text-muted-foreground">
                  could not load this question
                </p>
                <Button type="button" onClick={wrap(() => theoryOpenedRoute.loader.retry())}>
                  Retry
                </Button>
              </div>
            ) : isOpenedQuestionReady && openedQuestion === null ? (
              <p className="text-ui uppercase tracking-[2px] text-muted-foreground">
                question not found
              </p>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Spinner className="size-6" />
                <span className="sr-only">loading</span>
              </div>
            )
          ) : null}
        </>
      )}
    </section>
  );
}, "TheoryQuestions");

const TheoryPage = reatomComponent(() => {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
        <Button asChild className="size-7" size="icon" variant="ghost">
          <a aria-label="Home" href={questionsRoute.path()}>
            <House />
          </a>
        </Button>
        <a
          className="text-lg uppercase tracking-[2px] text-muted-foreground"
          href={questionsRoute.path()}
        >
          Interview helper
        </a>
        <CreateQuestionButton />
        <div className="flex items-center gap-3">
          <PublishQuestionsButton />
          <UserMenu />
          <ThemeSwitcher />
        </div>
      </header>
      <CreateQuestion />
      <UpdateQuestion />
      <DeleteQuestion />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TheoryQuestions />
      </main>
    </div>
  );
}, "TheoryPage");

export default TheoryPage;
