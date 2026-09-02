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
  createdDemoUser,
  demoCredentials,
  session,
  type DemoCredentials,
} from '@/shared/auth'

type SignInScreen = DeepReadonly<{ kind: 'loading' } | { kind: 'form' }>

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
      await wrap(clientApi.createDemoUser({ email, password }))
      await wrap(session.retry())
    },
  },
)

const fillSignInForm = (credentials: DemoCredentials) => {
  signInForm.fields.email.change(credentials.email)
  signInForm.fields.password.change(credentials.password)
}

export const signIn = computed((): SignInScreen => {
  if (!demoCredentials.ready()) {
    return { kind: 'loading' }
  }

  return { kind: 'form' }
}, 'signIn').extend(
  withConnectHook(() => {
    effect(() => {
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
