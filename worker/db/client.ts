import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema'

export const createDatabase = (database: D1Database) => {
  return drizzle(database, { schema })
}
