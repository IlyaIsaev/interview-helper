const ATX_H1_PATTERN = /^# (.+)$/;

export type ParsedQuestionMarkdown = {
  question: string;
  answer: string;
};

export function parseQuestionMarkdown(
  content: string,
): ParsedQuestionMarkdown | null {
  const firstLineEnd = content.indexOf('\n');
  const firstLine =
    firstLineEnd === -1 ? content : content.slice(0, firstLineEnd);
  const match = ATX_H1_PATTERN.exec(firstLine);

  if (!match) return null;

  const question = match[1];

  if (question.length === 0) return null;

  const rawAnswer =
    firstLineEnd === -1 ? '' : content.slice(firstLineEnd + 1);
  const answer =
    rawAnswer.startsWith('\n') ? rawAnswer.slice(1) : rawAnswer;

  return { question, answer };
}
