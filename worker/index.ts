import { sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { auth } from './auth'
import { createDatabase } from './db/client'
import { questions } from './questions'

const api = new Hono<{ Bindings: Env }>()

api.get('/health', async (context) => {
  const database = createDatabase(context.env.DB)

  await database.run(sql`SELECT 1`)

  return context.json({ ok: true })
})

const app = new Hono<{ Bindings: Env }>()

app.route('/api/auth', auth)
app.route('/api/questions', questions)
app.route('/api', api)

export default app
