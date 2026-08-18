import {
  atom,
  computed,
  effect,
  reatomForm,
  urlAtom,
  withAsyncData,
  withConnectHook,
  withCookie,
  wrap,
} from '@reatom/core'
import * as v from 'valibot'

import { clientApi } from '@/shared/api'
import { authClient, session } from '@/shared/auth'
import { homePath } from '@/shared/config'

type DemoCredentials = {
  email: string
  password: string
}

type SignInScreen = { kind: 'loading' } | { kind: 'form' }

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

const readDemoCredentials = (snapshot: string): DemoCredentials | null => {
  if (!snapshot) {
    return null
  }

  try {
    const credentials: unknown = JSON.parse(snapshot)

    if (typeof credentials !== 'object' || credentials === null) {
      return null
    }

    if (!('email' in credentials) || !('password' in credentials)) {
      return null
    }

    if (
      typeof credentials.email !== 'string' ||
      typeof credentials.password !== 'string'
    ) {
      return null
    }

    return {
      email: credentials.email,
      password: credentials.password,
    }
  } catch {
    return null
  }
}

const createdDemoUser = atom<DemoCredentials | null>(null, 'createdDemoUser').extend(
  withCookie({
    key: 'createdDemoUser',
    path: '/',
    expires: CREATED_DEMO_USER_EXPIRES_AT,
    // document.cookie cannot subscribe; CookieAttributes types this as `never`.
    // @ts-expect-error persist subscribe is a separate option from cookie attrs
    subscribe: false,
    toSnapshot: (credentials: DemoCredentials | null) =>
      credentials ? JSON.stringify(credentials) : '',
    fromSnapshot: readDemoCredentials,
  }),
)

const generatedDemoCredentials = computed(async () => {
  return await wrap(clientApi.loadDemoUser())
}, 'generatedDemoCredentials').extend(withAsyncData({ initState: null }))

const isDemoUserEmail = (email: string) => {
  return DEMO_USER_EMAIL_PATTERN.test(email)
}

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
      const storedCredentials = createdDemoUser()
      const shouldCreateDemoUser =
        isDemoUserEmail(email) && storedCredentials?.email !== email

      if (shouldCreateDemoUser) {
        await wrap(createDemoUser(email, password))
      } else {
        await wrap(signInWithPassword(email, password))
      }

      await wrap(session.retry())
      urlAtom.go(homePath)
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

  if (!generatedDemoCredentials.ready()) {
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

      const generatedCredentials = generatedDemoCredentials.data()

      if (!generatedCredentials) {
        return
      }

      fillSignInForm(generatedCredentials)
    }, 'signIn.prefillDemoCredentials')
  }),
)
