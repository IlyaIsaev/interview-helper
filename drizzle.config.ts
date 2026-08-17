import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { defineConfig } from 'drizzle-kit'

const LOCAL_D1_DIRECTORY = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject'

const resolveLocalD1SqlitePath = () => {
  if (!existsSync(LOCAL_D1_DIRECTORY)) {
    throw new Error(
      'Local D1 sqlite file not found. Run `pnpm db:migrate` or `pnpm dev` first.',
    )
  }

  const sqliteFileName = readdirSync(LOCAL_D1_DIRECTORY).find((fileName) => {
    return fileName.endsWith('.sqlite') && fileName !== 'metadata.sqlite'
  })

  if (!sqliteFileName) {
    throw new Error(
      'Local D1 sqlite file not found. Run `pnpm db:migrate` or `pnpm dev` first.',
    )
  }

  return join(LOCAL_D1_DIRECTORY, sqliteFileName)
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './worker/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: resolveLocalD1SqlitePath(),
  },
})
