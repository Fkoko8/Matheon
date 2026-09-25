import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Planer operuje na datach — stała strefa czasowa czyni testy deterministycznymi.
    env: { TZ: 'UTC' },
    include: ['lib/**/*.test.ts', 'content/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.next/**'],
  },
})
