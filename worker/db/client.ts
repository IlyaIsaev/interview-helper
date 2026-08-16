import { drizzle } from 'drizzle-orm/d1'

export const createDatabase = (database: D1Database) => {
  return drizzle(database)
}
