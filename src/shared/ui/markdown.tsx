import { map, pipe } from 'es-toolkit/fp'
import type { ComponentProps, ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

import { cn, markdownPlainText } from '@/shared/lib'

type MarkdownProps = {
  children: string
  className?: ComponentProps<'div'>['className']
  plain?: boolean
}

type MarkdownPlainNodeProps = {
  children?: ReactNode
}

type MarkdownRehypePlugins = NonNullable<
  ComponentProps<typeof ReactMarkdown>['rehypePlugins']
>

const isAllowedMarkdownUrl = (url: string): boolean => {
  const trimmedUrl = url.trim()

  if (trimmedUrl.length === 0) {
    return false
  }

  if (trimmedUrl.startsWith('#') || trimmedUrl.startsWith('/')) {
    return !trimmedUrl.startsWith('//')
  }

  try {
    const protocol = new URL(trimmedUrl).protocol

    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return !trimmedUrl.includes(':')
  }
}

const markdownUrl = (url: string): string => (isAllowedMarkdownUrl(url) ? url : '')

const markdownHighlightPlugins: MarkdownRehypePlugins = [
  [
    rehypeHighlight,
    {
      aliases: {
        typescript: ['ts', 'tsx'],
        javascript: ['js', 'jsx'],
      },
    },
  ],
]

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
  p: ({ node, ...props }) => (
    <p className="text-ui text-muted-foreground" {...props} />
  ),
  strong: ({ node, ...props }) => <strong className="font-medium" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4" {...props} />,
  li: ({ node, ...props }) => <li className="text-ui" {...props} />,
  a: ({ node, href, ...props }) =>
    href ? (
      <a
        className="text-primary"
        {...props}
        href={href}
        rel="noopener noreferrer nofollow"
        referrerPolicy="no-referrer"
      />
    ) : (
      <span>{props.children}</span>
    ),
  img: () => null,
  code: ({ node, className, ...props }) => (
    <code className={cn('text-foreground', className)} {...props} />
  ),
  pre: ({ node, className, ...props }) => (
    <pre className={cn('overflow-x-auto bg-card p-3 text-ui', className)} {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-border pl-3" {...props} />
  ),
}

const markdownPlainTags = [
  'a',
  'blockquote',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'ul',
] as const satisfies ReadonlyArray<keyof Components>

function MarkdownPlainNode({ children }: MarkdownPlainNodeProps) {
  return <>{children} </>
}

const markdownPlainComponents = pipe(
  markdownPlainTags,
  map((tag) => [tag, MarkdownPlainNode] as const),
  Object.fromEntries,
) as Components

function Markdown({ children, className, plain = false }: MarkdownProps) {
  if (plain) {
    return (
      <p className={cn('min-w-0 flex-1 truncate', className)}>
        <ReactMarkdown
          components={markdownPlainComponents}
          urlTransform={markdownUrl}
        >
          {children}
        </ReactMarkdown>
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <ReactMarkdown
        components={markdownComponents}
        rehypePlugins={markdownHighlightPlugins}
        urlTransform={markdownUrl}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export { Markdown, markdownPlainText }

export type { MarkdownProps }
