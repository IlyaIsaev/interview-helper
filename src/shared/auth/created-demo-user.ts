import { atom, computed, withAsyncData, withCookie, wrap } from '@reatom/core'
import type { DeepReadonly, JSONValue } from 'es-toolkit/types'

import { clientApi } from '@/shared/api'

export type DemoCredentials = DeepReadonly<{
  email: string
  password: string
}>

const CREATED_DEMO_USER_COOKIE_KEY = 'createdDemoUser'

const COOKIE_PATH = '/'

const CREATED_DEMO_USER_EXPIRES_AT = new Date('9999-12-31T23:59:59.000Z')

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

export const createdDemoUser = atom<DemoCredentials | null>(
  null,
  'createdDemoUser',
).extend(
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

export const demoCredentials = computed(async () => {
  return await wrap(clientApi.loadDemoUser())
}, 'demoCredentials').extend(withAsyncData({ initState: null }))
