// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      // eslint ignore globs here
    ],
  },
  {
    rules: {
      'node/prefer-global/process': 'off', // Отключает правило node/prefer-global/process
      'no-console': 'off', // Разрешает использование console.log,
      'import/first': 'off',
    },
  },
)
