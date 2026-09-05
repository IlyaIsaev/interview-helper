import { sql } from 'drizzle-orm'
import { Hono, type Context, type Next } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'

import { auth } from './auth'
import { createDatabase } from './db/client'
import { demoUser } from './demo-user'
import { questions } from './questions'

const JSON_BODY_LIMIT_BYTES = 128 * 1024

const connectingIp = (context: Context<{ Bindings: Env }>): string =>
  context.req.header('CF-Connecting-IP') ?? 'unknown'

const isAuthPostPath = (pathname: string): boolean =>
  pathname === '/api/demo-user' || pathname.startsWith('/api/auth/')

const limitAuthPosts = async (
  context: Context<{ Bindings: Env }>,
  next: Next,
) => {
  const pathname = new URL(context.req.url).pathname

  if (context.req.method !== 'POST' || !isAuthPostPath(pathname)) {
    await next()

    return
  }

  const { success } = await context.env.AUTH_RATE_LIMITER.limit({
    key: `${pathname}:${connectingIp(context)}`,
  })

  if (!success) {
    return context.json({ message: 'Too many requests' }, 429)
  }

  await next()
}

const api = new Hono<{ Bindings: Env }>().get('/health', async (context) => {
  const database = createDatabase(context.env.DB)

  await database.run(sql`SELECT 1`)

  return context.json({ ok: true }, 200)
})

const app = new Hono<{ Bindings: Env }>()
  .use(
    '/api/*',
    secureHeaders({
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      contentSecurityPolicy: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
      crossOriginEmbedderPolicy: false,
    }),
  )
  .use(
    '/api/*',
    bodyLimit({
      maxSize: JSON_BODY_LIMIT_BYTES,
      onError: (context) =>
        context.json({ message: 'Request body is too large' }, 413),
    }),
  )
  .use(limitAuthPosts)
  .route('/api/auth', auth)
  .route('/api/demo-user', demoUser)
  .route('/api/questions', questions)
  .route('/api', api)

export type AppType = typeof app

export default app
