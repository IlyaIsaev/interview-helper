import type { FieldAtom } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

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

export const QuestionFields = reatomComponent(
  ({ question, answer }: QuestionFieldsProps) => {
    const questionField = bindFormControl(question)
    const answerField = bindFormControl(answer)

    return (
      <>
        <FormField field={question}>
          <FormItem>
            <FormLabel>question</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              <FormControl>
                <Textarea className="min-h-32" {...questionField} />
              </FormControl>
              <MarkdownPreview>{question()}</MarkdownPreview>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField field={answer}>
          <FormItem>
            <FormLabel>answer</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              <FormControl>
                <Textarea className="min-h-32" {...answerField} />
              </FormControl>
              <MarkdownPreview>{answer()}</MarkdownPreview>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
      </>
    )
  },
  'QuestionFields',
)
