import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'

import * as schema from './schema'

export const createDatabase = (
  database: D1Database,
): DrizzleD1Database<typeof schema> & { $client: D1Database } => {
  return drizzle(database, { schema })
}
