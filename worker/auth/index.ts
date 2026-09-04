import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Hono } from 'hono'

import { createDatabase } from '../db/client'
import * as schema from '../db/schema'

export const createAuth = (env: Env) => {
  return betterAuth({
    appName: 'interview-helper',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(createDatabase(env.DB), {
      provider: 'sqlite',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
  })
}

export const auth = new Hono<{ Bindings: Env }>()

auth.on(['GET', 'POST'], '/*', (context) => {
  return createAuth(context.env).handler(context.req.raw)
})
