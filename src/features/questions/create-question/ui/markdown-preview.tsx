import Markdown, { type Components } from 'react-markdown'

import { cn } from '@/shared/lib'

type MarkdownPreviewProps = {
  children: string
}

const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1
      className="text-heading font-medium tracking-tight text-foreground"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-xl font-medium tracking-tight text-foreground" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-sm font-medium tracking-tight text-foreground" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-sm font-medium text-foreground" {...props} />
  ),
  h5: ({ node, ...props }) => (
    <h5 className="text-xs font-medium text-foreground" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <h6 className="text-xs font-medium text-foreground" {...props} />
  ),
  p: ({ node, ...props }) => <p className="text-ui text-muted-foreground" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-medium" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4" {...props} />,
  li: ({ node, ...props }) => <li className="text-ui" {...props} />,
  a: ({ node, ...props }) => <a className="text-primary" {...props} />,
  code: ({ node, ...props }) => <code className="text-foreground" {...props} />,
  pre: ({ node, ...props }) => (
    <pre className="overflow-x-auto text-foreground" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-border pl-3" {...props} />
  ),
}

export const MarkdownPreview = ({ children }: MarkdownPreviewProps) => {
  return (
    <div className={cn('min-h-32 space-y-2 border border-border bg-card p-3')}>
      <Markdown components={markdownComponents}>{children}</Markdown>
    </div>
  )
}
