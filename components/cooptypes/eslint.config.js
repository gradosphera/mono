import antfu from '@antfu/eslint-config'

// @ts-check

export default antfu(
  {
    typescript: true,
  },
  {
    ignores: [
      'docs/**/*',
    ],
  },
  {
    rules: {
      'jsdoc/empty-tags': 'off', // Добавьте это правило игнора
    },
  },
)
