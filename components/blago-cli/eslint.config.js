// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
      'no-console': 'off',
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'perfectionist/sort-named-imports': 'off',
      'regexp/no-obscure-range': 'off',
      'sort-imports': 'off',
      'ts/explicit-function-return-type': 'off',
    },
  },
  {
    ignores: ['dist/**', 'package.json', 'tsconfig.json'],
  },
)
