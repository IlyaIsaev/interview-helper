import * as v from 'valibot'

const QUESTION_FIELD_MAX_LENGTH = 20_000

export const questionFieldsSchema = v.object({
  question: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Enter a question'),
    v.maxLength(QUESTION_FIELD_MAX_LENGTH, 'Question is too long'),
  ),
  answer: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Enter an answer'),
    v.maxLength(QUESTION_FIELD_MAX_LENGTH, 'Answer is too long'),
  ),
})
