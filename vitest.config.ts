import { defineConfig } from 'vitest/config'

// Dedicated test config so vitest does NOT load the app's vite plugins
// (TanStack Start / React / nitro), which aren't needed for unit tests and
// otherwise cause slow teardown. The domain core is pure and runs in node.
// Component tests that need a DOM can opt in per-file with:
//   // @vitest-environment jsdom
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    passWithNoTests: true,
  },
})
