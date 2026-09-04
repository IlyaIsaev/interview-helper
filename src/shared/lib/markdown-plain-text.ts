import removeMarkdown from 'remove-markdown'

export const markdownPlainText = (markdown: string) =>
  removeMarkdown(markdown).replace(/\s+/g, ' ').trim()
