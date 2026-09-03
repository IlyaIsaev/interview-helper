import type { FieldAtom } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'
import {
  bindFormControl,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@/shared/ui'

import { MarkdownPreview } from './markdown-preview'

type QuestionFieldsProps = {
  question: FieldAtom<string>
  answer: FieldAtom<string>
}

type EditorShellProps = {
  children: ReactNode
}

const editorRowClassName = cn(
  'grid min-h-0 min-w-[40vw] flex-1 grid-cols-2 grid-rows-1 gap-3',
)

const editorShellClassName = cn(
  'h-full min-h-0',
  'focus-within:ring-[3px] focus-within:ring-ring/50',
  'has-[[aria-invalid=true]]:ring-[3px] has-[[aria-invalid=true]]:ring-destructive/20',
  'focus-within:has-[[aria-invalid=true]]:ring-destructive/20',
  'dark:has-[[aria-invalid=true]]:ring-destructive/40',
)

const editorClassName = cn(
  'h-full min-h-0 overflow-y-auto field-sizing-fixed resize-none',
  'focus-visible:ring-0 aria-invalid:ring-0',
)

function EditorShell({ children }: EditorShellProps) {
  return <div className={editorShellClassName}>{children}</div>
}

export const QuestionFields = reatomComponent(
  ({ question, answer }: QuestionFieldsProps) => {
    const questionField = bindFormControl(question)
    const answerField = bindFormControl(answer)

    return (
      <div className={cn('flex min-h-0 flex-1 flex-col gap-4 px-1')}>
        <FormField field={question}>
          <FormItem className="min-h-0 flex-1">
            <FormLabel>question</FormLabel>
            <div className={editorRowClassName}>
              <EditorShell>
                <FormControl>
                  <Textarea {...questionField} className={editorClassName} />
                </FormControl>
              </EditorShell>
              <MarkdownPreview>{question()}</MarkdownPreview>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField field={answer}>
          <FormItem className="min-h-0 flex-1">
            <FormLabel>answer</FormLabel>
            <div className={editorRowClassName}>
              <EditorShell>
                <FormControl>
                  <Textarea {...answerField} className={editorClassName} />
                </FormControl>
              </EditorShell>
              <MarkdownPreview>{answer()}</MarkdownPreview>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    )
  },
  'QuestionFields',
)
