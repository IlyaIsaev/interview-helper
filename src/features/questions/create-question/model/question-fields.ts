import * as v from 'valibot'

export const questionFieldsSchema = v.object({
  question: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter a question')),
  answer: v.pipe(v.string(), v.trim(), v.nonEmpty('Enter an answer')),
})
