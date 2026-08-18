import Markdown from 'react-markdown'

import { cn } from '@/shared/lib'

type MarkdownPreviewProps = {
  children: string
}

export const MarkdownPreview = ({ children }: MarkdownPreviewProps) => {
  return (
    <div
      className={cn(
        'min-h-32 border border-border bg-card p-3 text-ui text-muted-foreground',
        '[&_a]:text-primary [&_code]:text-foreground [&_pre]:overflow-x-auto',
      )}
    >
      <Markdown>{children}</Markdown>
    </div>
  )
}
