import { Markdown } from '@/shared/ui'

type MarkdownPreviewProps = {
  children: string
}

export function MarkdownPreview({ children }: MarkdownPreviewProps) {
  return (
    <Markdown className="h-full min-h-0 overflow-y-auto border border-border bg-card p-3">
      {children}
    </Markdown>
  )
}
