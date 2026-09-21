import type { CodeHighlighter, UrlTransform } from "@tanstack/markdown";
import { Markdown as TanStackMarkdown, type MarkdownComponents } from "@tanstack/markdown/react";
import { map, pipe } from "es-toolkit/fp";
import hljs from "highlight.js/lib/common";
import type { ComponentProps, ReactNode } from "react";

import { cn, markdownPlainText } from "@/shared/lib";

type MarkdownProps = {
  children: string;
  className?: ComponentProps<"div">["className"];
  plain?: boolean;
};

type MarkdownPlainNodeProps = {
  children?: ReactNode;
};

const markdownHighlightLanguages = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
} as const;

const isAllowedMarkdownUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) return false;

  if (trimmedUrl.startsWith("#") || trimmedUrl.startsWith("/")) return !trimmedUrl.startsWith("//");

  try {
    const protocol = new URL(trimmedUrl).protocol;

    return protocol === "https:" || protocol === "http:";
  } catch {
    return !trimmedUrl.includes(":");
  }
};

const markdownUrl: UrlTransform = (_url, kind, defaultUrl) => {
  if (kind === "image") return defaultUrl;

  if (!isAllowedMarkdownUrl(defaultUrl)) return null;

  return defaultUrl;
};

const highlightMarkdownCode: CodeHighlighter = (code, lang = "plaintext") => {
  const language =
    lang in markdownHighlightLanguages
      ? markdownHighlightLanguages[lang as keyof typeof markdownHighlightLanguages]
      : lang;
  const highlightLanguage = hljs.getLanguage(language) === undefined ? "plaintext" : language;

  return hljs.highlight(code, { language: highlightLanguage, ignoreIllegals: true }).value;
};

const markdownComponents = {
  a: ({ href, ...props }) =>
    href ? (
      <a {...props} href={href} rel="noopener noreferrer nofollow" referrerPolicy="no-referrer" />
    ) : (
      <span>{props.children}</span>
    ),
  img: () => null,
} satisfies MarkdownComponents;

const markdownPlainTags = [
  "a",
  "blockquote",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "ul",
] as const;

function MarkdownPlainNode({ children }: MarkdownPlainNodeProps) {
  return <>{children} </>;
}

// Object.fromEntries widens keys; the tag list is a MarkdownComponents key union.
const markdownPlainComponents = pipe(
  markdownPlainTags,
  map((tag) => [tag, MarkdownPlainNode] as const),
  Object.fromEntries,
) as MarkdownComponents;

const markdownParseOptions = {
  frontmatter: false,
  headingIds: false,
  urlTransform: markdownUrl,
} as const;

function Markdown({ children, className, plain = false }: MarkdownProps) {
  if (plain) {
    return (
      <p className={cn("min-w-0 flex-1 truncate", className)}>
        <TanStackMarkdown {...markdownParseOptions} components={markdownPlainComponents}>
          {children}
        </TanStackMarkdown>
      </p>
    );
  }

  return (
    <div className={cn("prose max-w-none", className)}>
      <TanStackMarkdown
        {...markdownParseOptions}
        components={markdownComponents}
        highlighter={highlightMarkdownCode}
      >
        {children}
      </TanStackMarkdown>
    </div>
  );
}

export { Markdown, markdownPlainText };

export type { MarkdownProps };
