import { cn } from '@/shared/lib';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Markdown,
  Spinner,
} from '@/shared/ui';

import type { OpenedQuestion } from '../model/question';

const questionPreviewClassName = cn(
  'mx-auto flex h-full min-h-0 w-full max-w-[80ch] flex-1 flex-col gap-4 px-4 py-4',
);

const questionAnswerColumnClassName = cn('flex min-h-0 flex-1 flex-col');

type QuestionPreviewProps = {
  open: boolean;
  question: OpenedQuestion | null;
  onOpenChange: (open: boolean) => void;
};

export function QuestionPreview({
  open,
  question,
  onOpenChange,
}: QuestionPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] min-h-0 w-[min(calc(80ch+3rem),calc(100%-2rem))] flex-col overflow-clip [overflow-clip-margin:6px] sm:max-w-[calc(80ch+3rem)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Question</DialogTitle>
          <DialogDescription>Question and answer.</DialogDescription>
        </DialogHeader>
        {!question ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <Spinner className="size-6" />
            <span className="sr-only">loading</span>
          </div>
        ) : (
          <section className={questionPreviewClassName}>
            <div className={questionAnswerColumnClassName}>
              <Markdown className="shrink-0">{question.question}</Markdown>
              <div className="h-[3lh] shrink-0" aria-hidden="true" />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <Markdown>{question.answer}</Markdown>
              </div>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
