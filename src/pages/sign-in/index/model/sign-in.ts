import {
  atom,
  computed,
  effect,
  reatomForm,
  withAsyncData,
  withConnectHook,
  withCookie,
  wrap,
} from '@reatom/core'
import * as v from 'valibot'

import type { DeepReadonly, JSONValue } from 'es-toolkit/types'

import { clientApi } from '@/shared/api'
import { authClient, session } from '@/shared/auth'

type DemoCredentials = DeepReadonly<{
  email: string
  password: string
}>

type SignInScreen = DeepReadonly<{ kind: 'loading' } | { kind: 'form' }>

const CREATED_DEMO_USER_COOKIE_KEY = 'createdDemoUser'

const COOKIE_PATH = '/'

const CREATED_DEMO_USER_EXPIRES_AT = new Date('9999-12-31T23:59:59.000Z')

const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/

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

const isDemoCredentials = (json: JSONValue): json is DemoCredentials =>
  typeof json === 'object' &&
  json !== null &&
  !Array.isArray(json) &&
  typeof json.email === 'string' &&
  typeof json.password === 'string'

const readDemoCredentials = (snapshot: string): DemoCredentials | null => {
  if (!snapshot) {
    return null
  }

  try {
    const credentials: JSONValue = JSON.parse(snapshot) as JSONValue

    return isDemoCredentials(credentials) ? credentials : null
  } catch {
    return null
  }
}

const createdDemoUser = atom<DemoCredentials | null>(null, 'createdDemoUser').extend(
  withCookie({
    key: CREATED_DEMO_USER_COOKIE_KEY,
    path: COOKIE_PATH,
    expires: CREATED_DEMO_USER_EXPIRES_AT,
    // document.cookie cannot subscribe; CookieAttributes types this as `never`.
    // @ts-expect-error persist subscribe is a separate option from cookie attrs
    subscribe: false,
    toSnapshot: (credentials: DemoCredentials | null) =>
      credentials ? JSON.stringify(credentials) : '',
    fromSnapshot: readDemoCredentials,
  }),
)

const demoCredentials = computed(async () => {
  return await wrap(clientApi.loadDemoUser())
}, 'demoCredentials').extend(withAsyncData({ initState: null }))

const isDemoUserEmail = (email: string): boolean =>
  DEMO_USER_EMAIL_PATTERN.test(email)

const signInWithPassword = async (email: string, password: string) => {
  const { error } = await wrap(
    authClient.signIn.email({
      email,
      password,
    }),
  )

  if (error) {
    throw new Error(error.message)
  }
}

const createDemoUser = async (email: string, password: string) => {
  await wrap(clientApi.createDemoUser({ email, password }))
  createdDemoUser.set({ email, password })
}

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
      const credentials = createdDemoUser()
      const shouldCreateDemoUser =
        isDemoUserEmail(email) && credentials?.email !== email

      if (shouldCreateDemoUser) {
        await wrap(createDemoUser(email, password))
      }

      if (!shouldCreateDemoUser) {
        await wrap(signInWithPassword(email, password))
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

  if (!demoCredentials.ready()) {
    return { kind: 'loading' }
  }

  return { kind: 'form' }
}, 'signIn').extend(
  withConnectHook(() => {
    effect(() => {
      const credentials = createdDemoUser() ?? demoCredentials.data()

      if (!credentials) {
        return
      }

      fillSignInForm(credentials)
    }, 'signIn.prefillDemoCredentials')
  }),
)
