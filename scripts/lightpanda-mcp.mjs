#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'

const defaultExecutablePath = `${homedir()}/.cache/lightpanda-node/lightpanda`

const executablePath = () =>
  process.env.LIGHTPANDA_EXECUTABLE_PATH ?? defaultExecutablePath

const runMcp = (binary) => {
  const child = spawn(binary, ['mcp', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      LIGHTPANDA_DISABLE_TELEMETRY:
        process.env.LIGHTPANDA_DISABLE_TELEMETRY ?? 'true',
    },
  })

  child.on('error', (error) => {
    console.error(error)
    process.exit(1)
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)

      return
    }

    process.exit(code ?? 1)
  })
}

const binary = executablePath()

if (!existsSync(binary)) {
  console.error('Lightpanda binary not installed. Run `pnpm lightpanda:install`.')
  process.exit(1)
}

runMcp(binary)
