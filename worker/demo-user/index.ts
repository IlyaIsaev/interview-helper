import { vValidator } from '@hono/valibot-validator'
import { eq } from 'drizzle-orm'
import { Hono, type Context } from 'hono'
import { deleteCookie, generateCookie, getCookie, setCookie } from 'hono/cookie'
import { csrf } from 'hono/csrf'
import * as v from 'valibot'

import { createAuth, isTrustedAuthOrigin } from '../auth'
import { createDatabase } from '../db/client'
import { account, session, user } from '../db/schema'

const DEMO_USER_NAME = 'Demo user'

const CREATED_DEMO_USER_COOKIE_KEY = 'createdDemoUser'

const BETTER_AUTH_SESSION_TOKEN_COOKIE = 'better-auth.session_token'

const DEMO_CREDENTIALS_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/

const PASSWORD_CHARACTERS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'

const PRIVATE_NO_STORE = 'private, no-store'

const demoSignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(DEMO_USER_EMAIL_PATTERN, 'Must be a demo user email'),
  ),
  password: v.pipe(v.string(), v.minLength(8, 'Password is too short')),
})

type DemoCredentials = v.InferOutput<typeof demoSignInSchema>

type DemoUserContext = Context<{ Bindings: Env }>

const selectRandomPasswordCharacter = (): string => {
  const characterIndex =
    crypto.getRandomValues(new Uint32Array(1))[0] % PASSWORD_CHARACTERS.length

  return PASSWORD_CHARACTERS[characterIndex] ?? 'A'
}

const createDemoPassword = (): string => {
  const randomCharacters = Array.from({ length: 16 }, selectRandomPasswordCharacter).join(
    '',
  )

  return `${randomCharacters}Aa1!`
}

const createDemoEmail = (): string => {
  const shortId = crypto.randomUUID().replaceAll('-', '').slice(0, 8)

  return `demo-user-${shortId}@demo.com`
}

const isHttpsRequest = (context: DemoUserContext): boolean =>
  new URL(context.req.url).protocol === 'https:'

const demoCredentialsCookieOptions = (context: DemoUserContext) => ({
  path: '/',
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure: isHttpsRequest(context),
  maxAge: DEMO_CREDENTIALS_COOKIE_MAX_AGE_SECONDS,
})

const sessionCookieOptions = (context: DemoUserContext) => ({
  path: '/',
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure: isHttpsRequest(context),
})

const readStoredDemoCredentials = (
  snapshot: string | undefined,
): DemoCredentials | null => {
  if (!snapshot) {
    return null
  }

  try {
    const parsedCredentials = v.safeParse(
      demoSignInSchema,
      JSON.parse(snapshot) as unknown,
    )

    return parsedCredentials.success ? parsedCredentials.output : null
  } catch {
    return null
  }
}

const persistDemoCredentials = (
  context: DemoUserContext,
  credentials: DemoCredentials,
) => {
  setCookie(
    context,
    CREATED_DEMO_USER_COOKIE_KEY,
    JSON.stringify(credentials),
    demoCredentialsCookieOptions(context),
  )
  context.header('Cache-Control', PRIVATE_NO_STORE)
}

const responseWithDemoCredentials = (
  context: DemoUserContext,
  response: Response,
  credentials: DemoCredentials,
): Response => {
  const headers = new Headers(response.headers)

  headers.append(
    'Set-Cookie',
    generateCookie(
      CREATED_DEMO_USER_COOKIE_KEY,
      JSON.stringify(credentials),
      demoCredentialsCookieOptions(context),
    ),
  )
  headers.set('Cache-Control', PRIVATE_NO_STORE)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const expireSessionCookies = (context: DemoUserContext) => {
  const cookieOptions = sessionCookieOptions(context)

  deleteCookie(context, BETTER_AUTH_SESSION_TOKEN_COOKIE, cookieOptions)
  deleteCookie(context, BETTER_AUTH_SESSION_TOKEN_COOKIE, {
    ...cookieOptions,
    prefix: 'secure',
  })
}

export const demoUser = new Hono<{ Bindings: Env }>()
  .use(
    csrf({
      origin: (origin, context) =>
        isTrustedAuthOrigin(origin, context.env.BETTER_AUTH_URL),
    }),
  )
  .get('/', (context) => {
    const storedDemoCredentials = readStoredDemoCredentials(
      getCookie(context, CREATED_DEMO_USER_COOKIE_KEY),
    )
    const demoCredentials = storedDemoCredentials ?? {
      email: createDemoEmail(),
      password: createDemoPassword(),
    }

    persistDemoCredentials(context, demoCredentials)

    return context.json(demoCredentials, 200)
  })
  .post('/', vValidator('json', demoSignInSchema), async (context) => {
    const demoSignIn = context.req.valid('json')
    const auth = createAuth(context.env)

    try {
      const signUpResponse = await auth.api.signUpEmail({
        body: {
          name: DEMO_USER_NAME,
          email: demoSignIn.email,
          password: demoSignIn.password,
        },
        headers: context.req.raw.headers,
        asResponse: true,
      })

      if (signUpResponse.ok) {
        return responseWithDemoCredentials(context, signUpResponse, demoSignIn)
      }

      if (signUpResponse.status !== 422) {
        return signUpResponse
      }
    } catch (error) {
      const errorStatus =
        typeof error === 'object' && error !== null && 'status' in error
          ? error.status
          : null

      if (errorStatus !== 422 && errorStatus !== 'UNPROCESSABLE_ENTITY') {
        throw error
      }
    }

    const signInResponse = await auth.api.signInEmail({
      body: {
        email: demoSignIn.email,
        password: demoSignIn.password,
      },
      headers: context.req.raw.headers,
      asResponse: true,
    })

    return signInResponse.ok
      ? responseWithDemoCredentials(context, signInResponse, demoSignIn)
      : signInResponse
  })
  .delete('/', async (context) => {
    const currentSession = await createAuth(context.env).api.getSession({
      headers: context.req.raw.headers,
    })

    if (!currentSession) {
      return context.json({ message: 'Unauthorized' }, 401)
    }

    const database = createDatabase(context.env.DB)
    const userId = currentSession.user.id

    await database.delete(session).where(eq(session.userId, userId))
    await database.delete(account).where(eq(account.userId, userId))
    await database.delete(user).where(eq(user.id, userId))

    deleteCookie(
      context,
      CREATED_DEMO_USER_COOKIE_KEY,
      demoCredentialsCookieOptions(context),
    )
    expireSessionCookies(context)

    return context.body(null, 204)
  })
