import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      'no-alert': 0,
      camelcase: 0,
      'no-console': 0,
      'no-unused-vars': 0,
      'no-param-reassign': 0,
      'no-underscore-dangle': 0,
      'no-restricted-exports': 0,
      'no-promise-executor-return': 0,
      '@typescript-eslint/naming-convention': 0,
      '@typescript-eslint/no-use-before-define': 0,
      'prefer-destructuring': [
        1,
        {
          object: true,
          array: false
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        1,
        {
          args: 'none'
        }
      ],
      'unused-imports/no-unused-imports': 0,
      'unused-imports/no-unused-vars': [
        0,
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 0,
      'import/prefer-default-export': 0
    }
  }
)
