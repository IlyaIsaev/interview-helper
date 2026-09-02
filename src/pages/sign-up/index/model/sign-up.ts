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

type SignUpScreen = DeepReadonly<{ kind: 'loading' } | { kind: 'form' }>

const DEMO_USER_NAME = 'Demo user'

const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/

const isDemoEmail = (email: string) => DEMO_USER_EMAIL_PATTERN.test(email)

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
      if (isDemoEmail(email)) {
        await wrap(clientApi.createDemoUser({ email, password }))
        await wrap(session.retry())

        return
      }

      const { error } = await wrap(
        authClient.signUp.email({
          name,
          email,
          password,
        }),
      )

      if (error) {
        throw new Error(error.message)
      }

      await wrap(session.retry())
    },
  },
)

const fillSignUpForm = (credentials: DemoCredentials) => {
  signUpForm.fields.name.change(DEMO_USER_NAME)
  signUpForm.fields.email.change(credentials.email)
  signUpForm.fields.password.change(credentials.password)
}

export const signUp = computed((): SignUpScreen => {
  if (!demoCredentials.ready()) {
    return { kind: 'loading' }
  }

  return { kind: 'form' }
}, 'signUp').extend(
  withConnectHook(() => {
    if (demoCredentials.ready()) {
      demoCredentials.retry()
    }

    effect(() => {
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

      fillSignUpForm(credentials)
    }, 'signUp.prefillDemoCredentials')
  }),
)

signUpForm.validation.triggerSchemaValidation()
