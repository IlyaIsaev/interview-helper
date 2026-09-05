import { reatomForm, wrap } from '@reatom/core'
import * as v from 'valibot'

import { authClient, session } from '@/shared/auth'

const signUpSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Enter a name')),
  email: v.pipe(
    v.string(),
    v.nonEmpty('Enter an email'),
    v.email('Enter a valid email'),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Enter a password'),
    v.minLength(8, 'Use at least 8 characters'),
  ),
})

export const signUpForm = reatomForm(
  {
    name: '',
    email: '',
    password: '',
  },
  {
    name: 'signUpForm',
    validateOnBlur: true,
    validateOnChange: true,
    schema: signUpSchema,
    onSubmit: async ({ name, email, password }) => {
      const { error } = await wrap(
        authClient.signUp.email({
          name,
          email,
          password,
        }),
      )

      if (error) {
        throw new Error(
          'Could not create the account. Try a different email or sign in.',
        )
      }

      await wrap(session.retry())
    },
  },
)

signUpForm.validation.triggerSchemaValidation()
