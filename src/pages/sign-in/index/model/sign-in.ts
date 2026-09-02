import { computed, effect, reatomForm, withConnectHook, wrap } from '@reatom/core'
import * as v from 'valibot'

import { authClient, createdDemoUser, session, type DemoCredentials } from '@/shared/auth'
import { toast } from '@/shared/ui'

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
        toast.error("This user doesn't exist anymore.")

        return
      }

      await wrap(session.retry())
    },
  },
)

const fillSignInForm = (credentials: DemoCredentials) => {
  signInForm.fields.email.change(credentials.email)
  signInForm.fields.password.change(credentials.password)
}

export const signIn = computed(() => true, 'signIn').extend(
  withConnectHook(() => {
    effect(() => {
      const credentials = createdDemoUser()

      if (!credentials) {
        signInForm.reset()
        signInForm.validation.triggerSchemaValidation()

        return
      }

      fillSignInForm(credentials)
    }, 'signIn.prefillCreatedDemoUser')
  }),
)

signInForm.validation.triggerSchemaValidation()
