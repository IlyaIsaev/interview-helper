import { vValidator } from '@hono/valibot-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import * as v from 'valibot'

import { createAuth } from './auth'
import { createDatabase } from './db/client'
import { account, session, user } from './db/schema'

const DEMO_USER_NAME = 'Demo user'

const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/

const PASSWORD_CHARACTERS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'

const demoSignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(DEMO_USER_EMAIL_PATTERN, 'Must be a demo user email'),
  ),
  password: v.pipe(v.string(), v.minLength(8, 'Password is too short')),
})

const isDemoUserEmail = (email: string) => {
  return DEMO_USER_EMAIL_PATTERN.test(email)
}

const selectRandomPasswordCharacter = () => {
  const characterIndex =
    crypto.getRandomValues(new Uint32Array(1))[0] % PASSWORD_CHARACTERS.length

  return PASSWORD_CHARACTERS[characterIndex] ?? 'A'
}

const createDemoPassword = () => {
  const randomCharacters = Array.from({ length: 16 }, selectRandomPasswordCharacter).join(
    '',
  )

  return `${randomCharacters}Aa1!`
}

const createDemoEmail = () => {
  const shortId = crypto.randomUUID().replaceAll('-', '').slice(0, 8)

  return `demo-user-${shortId}@demo.com`
}

export const demoUser = new Hono<{ Bindings: Env }>()
  .get('/', (context) => {
    return context.json(
      {
        email: createDemoEmail(),
        password: createDemoPassword(),
      },
      200,
    )
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

      if (signUpResponse.ok || signUpResponse.status !== 422) {
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

    return auth.api.signInEmail({
      body: {
        email: demoSignIn.email,
        password: demoSignIn.password,
      },
      headers: context.req.raw.headers,
      asResponse: true,
    })
  })
  .delete('/', async (context) => {
    const currentSession = await createAuth(context.env).api.getSession({
      headers: context.req.raw.headers,
    })

    if (!currentSession) {
      return context.json({ message: 'Unauthorized' }, 401)
    }

    if (!isDemoUserEmail(currentSession.user.email)) {
      return context.json({ message: 'Forbidden' }, 403)
    }

    const database = createDatabase(context.env.DB)
    const userId = currentSession.user.id

    await database.delete(session).where(eq(session.userId, userId))
    await database.delete(account).where(eq(account.userId, userId))
    await database.delete(user).where(eq(user.id, userId))

    return context.body(null, 204)
  })
