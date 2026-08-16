import { sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { createDatabase } from './db/client'

const api = new Hono<{ Bindings: Env }>()

api.get('/health', async (context) => {
  const database = createDatabase(context.env.DB)

  await database.run(sql`SELECT 1`)

  return context.json({ ok: true })
})

const app = new Hono<{ Bindings: Env }>()

app.route('/api', api)

export default app
