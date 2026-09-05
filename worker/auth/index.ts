import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Hono } from 'hono'

import { createDatabase } from '../db/client'
import * as schema from '../db/schema'

const LOCAL_DEV_ORIGINS = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
] as const

export const trustedOriginsFor = (betterAuthUrl: string): Array<string> => {
  const origin = new URL(betterAuthUrl).origin

  return origin === LOCAL_DEV_ORIGINS[0] || origin === LOCAL_DEV_ORIGINS[1]
    ? [...LOCAL_DEV_ORIGINS]
    : [origin]
}

export const isTrustedAuthOrigin = (origin: string, betterAuthUrl: string): boolean =>
  trustedOriginsFor(betterAuthUrl).includes(origin)

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
    trustedOrigins: trustedOriginsFor(env.BETTER_AUTH_URL),
    rateLimit: {
      enabled: true,
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ['cf-connecting-ip'],
      },
    },
  })
}

export const auth = new Hono<{ Bindings: Env }>()

auth.on(['GET', 'POST'], '/*', (context) => {
  return createAuth(context.env).handler(context.req.raw)
})
