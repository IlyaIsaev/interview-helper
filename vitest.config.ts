import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const srcRoot = resolve(import.meta.dirname, 'src')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/app': resolve(srcRoot, 'app'),
      '@/pages': resolve(srcRoot, 'pages'),
      '@/features': resolve(srcRoot, 'features'),
      '@/entities': resolve(srcRoot, 'entities'),
      '@/shared': resolve(srcRoot, 'shared'),
    },
  },
  test: {
    include: ['src/**/tests/**/*.test.ts', 'src/**/tests/**/*.test.tsx', 'worker/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
})
