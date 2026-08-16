import { reatomForm, urlAtom, wrap } from '@reatom/core'
import * as v from 'valibot'

import { authClient, session } from '@/shared/auth'
import { homePath } from '@/shared/config'

const signInSchema = v.object({
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

export const signInForm = reatomForm(
  {
    email: '',
    password: '',
  },
  {
    name: 'signInForm',
    validateOnBlur: true,
    validateOnChange: true,
    schema: signInSchema,
    onSubmit: async ({ email, password }) => {
      const { error } = await wrap(
        authClient.signIn.email({
          email,
          password,
        }),
      )

      if (error) {
        throw new Error(error.message)
      }

      await wrap(session.retry())
      urlAtom.go(homePath)
    },
  },
)

signInForm.validation.triggerSchemaValidation()
