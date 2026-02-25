import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 240000,
    hookTimeout: 240000,
    sequence: {
      concurrent: false,
    },
  },
})
