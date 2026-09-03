import { expect, test } from 'vitest'

import { initQuestionList } from '@/entities/question'

import { filteredQuestions, questionSearch } from './question-search'

test('empty search returns every loaded question', () => {
  questionSearch.reset()
  initQuestionList([
    { id: '1', question: '# Hello field' },
    { id: '2', question: 'Other' },
  ])

  expect(filteredQuestions()).toEqual([
    { id: '1', question: '# Hello field' },
    { id: '2', question: 'Other' },
  ])
})

test('search matches visible question text and ignores markdown syntax', () => {
  questionSearch.reset()
  initQuestionList([
    { id: '1', question: '# Hello field' },
    { id: '2', question: 'Other' },
  ])
  questionSearch.set('hello')

  expect(filteredQuestions()).toEqual([{ id: '1', question: '# Hello field' }])

  questionSearch.set('#')

  expect(filteredQuestions()).toEqual([])
})
