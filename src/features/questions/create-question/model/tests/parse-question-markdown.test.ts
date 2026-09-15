import { expect, test } from 'vitest';

import { parseQuestionMarkdown } from '../parse-question-markdown';

test('parses an ATX h1 question and markdown answer body', () => {
  const content = '# What is FSD?\n\n**Feature-Sliced Design**';

  expect(parseQuestionMarkdown(content)).toEqual({
    question: 'What is FSD?',
    answer: '**Feature-Sliced Design**',
  });
});

test('parses a title-only file with an empty answer', () => {
  expect(parseQuestionMarkdown('# Solo title')).toEqual({
    question: 'Solo title',
    answer: '',
  });
});

test('rejects a second-level heading', () => {
  expect(parseQuestionMarkdown('## Not h1\n\nBody')).toBeNull();
});

test('rejects content without a leading h1', () => {
  expect(parseQuestionMarkdown('Plain question\n\nAnswer')).toBeNull();
});

test('rejects a blank first line before the heading', () => {
  expect(parseQuestionMarkdown('\n# Title\n\nBody')).toBeNull();
});

test('rejects setext-style headings', () => {
  expect(parseQuestionMarkdown('Title\n=====\n\nBody')).toBeNull();
});

test('rejects an h1 with no title text', () => {
  expect(parseQuestionMarkdown('# \n\nBody')).toBeNull();
});
