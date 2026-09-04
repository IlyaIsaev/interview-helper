import { expect, test } from 'vitest'

import { questionsMatchingSearch } from './question-search'

test('empty search returns every question', () => {
  const questions = [
    { id: '1', question: '# Hello field' },
    { id: '2', question: 'Other' },
  ]

  expect(questionsMatchingSearch(questions, '')).toEqual(questions)
  expect(questionsMatchingSearch(questions, '   ')).toEqual(questions)
})

test('search matches visible question text and ignores markdown syntax', () => {
  const questions = [
    { id: '1', question: '# Hello field' },
    { id: '2', question: 'Other' },
  ]

  expect(questionsMatchingSearch(questions, 'hello')).toEqual([
    { id: '1', question: '# Hello field' },
  ])

  expect(questionsMatchingSearch(questions, '#')).toEqual([])
})
