import {
  computed,
  effect,
  peek,
  reatomForm,
  withConnectHook,
  wrap,
} from '@reatom/core'
import * as v from 'valibot'

import type { DeepReadonly } from 'es-toolkit/types'

import { clientApi } from '@/shared/api'
import {
  authClient,
  createdDemoUser,
  demoCredentials,
  session,
  type DemoCredentials,
} from '@/shared/auth'
import { toast } from '@/shared/ui'

type SignInScreen = DeepReadonly<{ kind: 'loading' } | { kind: 'form' }>

const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/

const isDemoEmail = (email: string) => DEMO_USER_EMAIL_PATTERN.test(email)

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
      if (isDemoEmail(email)) {
        await wrap(clientApi.createDemoUser({ email, password }))
        await wrap(session.retry())

        return
      }

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

export const signIn = computed((): SignInScreen => {
  if (createdDemoUser()) {
    return { kind: 'form' }
  }

  demoCredentials.data()

  if (!demoCredentials.ready() || !demoCredentials.data()) {
    return { kind: 'loading' }
  }

  return { kind: 'form' }
}, 'signIn').extend(
  withConnectHook(() => {
    effect(() => {
      const storedCredentials = createdDemoUser()

      if (storedCredentials) {
        fillSignInForm(storedCredentials)

        return
      }

      if (!demoCredentials.ready()) {
        return
      }

      const credentials = demoCredentials.data()

      if (!credentials) {
        return
      }

      if (peek(createdDemoUser)?.email !== credentials.email) {
        createdDemoUser.set(credentials)
      }

      fillSignInForm(credentials)
    }, 'signIn.prefillDemoCredentials')
  }),
)

signInForm.validation.triggerSchemaValidation()
