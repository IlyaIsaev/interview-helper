import { map, pipe } from 'es-toolkit/fp';
import type { ComponentProps, ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

import { cn, markdownPlainText } from '@/shared/lib';

type MarkdownProps = {
  children: string;
  className?: ComponentProps<'div'>['className'];
  plain?: boolean;
};

type MarkdownPlainNodeProps = {
  children?: ReactNode;
};

type MarkdownRehypePlugins = NonNullable<
  ComponentProps<typeof ReactMarkdown>['rehypePlugins']
>;

const isAllowedMarkdownUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) return false;

  if (trimmedUrl.startsWith('#') || trimmedUrl.startsWith('/')) return !trimmedUrl.startsWith('//');

  try {
    const protocol = new URL(trimmedUrl).protocol;

    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return !trimmedUrl.includes(':');
  }
};

const markdownUrl = (url: string): string => (isAllowedMarkdownUrl(url) ? url : '');

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
];

const markdownComponents: Components = {
  a: ({ node: _node, href, ...props }) =>
    href ? (
      <a
        {...props}
        href={href}
        rel="noopener noreferrer nofollow"
        referrerPolicy="no-referrer"
      />
    ) : (
      <span>{props.children}</span>
    ),
  img: () => null,
  p: ({ node: _node, className: _className, ...props }) => <p {...props} />,
};

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
] as const satisfies ReadonlyArray<keyof Components>;

function MarkdownPlainNode({ children }: MarkdownPlainNodeProps) {
  return <>{children} </>;
}

// Object.fromEntries widens keys; the tag list is a Components key union.
const markdownPlainComponents = pipe(
  markdownPlainTags,
  map((tag) => [tag, MarkdownPlainNode] as const),
  Object.fromEntries,
) as Components;

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
    );
  }

  return (
    <div className={cn('prose max-w-none', className)}>
      <ReactMarkdown
        components={markdownComponents}
        rehypePlugins={markdownHighlightPlugins}
        urlTransform={markdownUrl}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export { Markdown, markdownPlainText };

export type { MarkdownProps };
