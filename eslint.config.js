//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    // Config files (not part of the typed-lint tsconfig project) plus starter
    // example/scaffolding code that is pending removal during the product build
    // (see plans/approved + ADR 0003). Excluded from lint only — still in the app.
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'commitlint.config.js',
      '.dependency-cruiser.js',
      'src/routes/demo/**',
    ],
  },
]
