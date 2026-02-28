import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './test/setup.ts',
    testTimeout: 120000,
    fileParallelism: false,
  },
})
