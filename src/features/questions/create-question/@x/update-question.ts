// Create and update share the same question/answer fields but are distinct
// user actions (different trigger, mutation, and post-success flow), so the
// slices stay separate. Field UI is form chrome, not a domain model, so it
// stays here rather than entities. Cross-import is last resort.

export { questionFieldsSchema } from '../model/question-fields'

export { QuestionFields } from '../ui/question-fields'
