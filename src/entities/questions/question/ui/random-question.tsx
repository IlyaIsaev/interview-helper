import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { cn } from '@/shared/lib';
import { Button, Markdown } from '@/shared/ui';

import { openNextQuestion, otherQuestions } from '../model/next-question';
import { question } from '../model/question';
import { isAnswerVisible, showAnswer } from '../model/show-answer';

const randomQuestionClassName = cn(
  'mx-auto flex h-full min-h-0 w-full max-w-[80ch] flex-1 flex-col gap-4 px-4 pt-10 pb-4',
);

const questionAnswerColumnClassName = cn('flex min-h-0 flex-1 flex-col');

export const RandomQuestion = reatomComponent(() => {
  const openedQuestion = question();

  if (!openedQuestion) {
    return (
      <section className={randomQuestionClassName}>
        <p className="text-xs uppercase tracking-[2px] text-muted-foreground">
          question not found
        </p>
      </section>
    );
  }

  const handleShowAnswer = wrap(showAnswer);

  const handleOpenNextQuestion = wrap(openNextQuestion);

  return (
    <section className={randomQuestionClassName}>
      <div className={questionAnswerColumnClassName}>
        <Markdown className="shrink-0">{openedQuestion.question}</Markdown>
        <div
          className={cn('shrink-0', isAnswerVisible() ? 'h-6' : 'h-4')}
          aria-hidden="true"
        />
        {isAnswerVisible() ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Markdown>{openedQuestion.answer}</Markdown>
          </div>
        ) : (
          <Button
            key={openedQuestion.question}
            className="mt-auto shrink-0"
            type="button"
            autoFocus
            onClick={handleShowAnswer}
          >
            Show answer
          </Button>
        )}
      </div>
      {isAnswerVisible() && otherQuestions().length > 0 ? (
        <Button
          className="mt-auto shrink-0"
          type="button"
          autoFocus
          onClick={handleOpenNextQuestion}
        >
          Next question
        </Button>
      ) : null}
    </section>
  );
}, 'RandomQuestion');
