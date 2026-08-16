import { sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { auth } from './auth'
import { createDatabase } from './db/client'
import { demoUser } from './demo-user'
import { questions } from './questions'

const api = new Hono<{ Bindings: Env }>().get('/health', async (context) => {
  const database = createDatabase(context.env.DB)

  await database.run(sql`SELECT 1`)

  return context.json({ ok: true }, 200)
})

const app = new Hono<{ Bindings: Env }>()
  .route('/api/auth', auth)
  .route('/api/demo-user', demoUser)
  .route('/api/questions', questions)
  .route('/api', api)

export type AppType = typeof app

export default app
