import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: [
      // Dependencies
      'node_modules/',
      '.pnpm/',

      // Build outputs
      '.next/',
      'out/',
      'dist/',
      'build/',

      // Environment files
      '.env*',
      '!.env.example',

      // Logs
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'pnpm-debug.log*',

      // Runtime data
      'pids',
      '*.pid',
      '*.seed',
      '*.pid.lock',

      // Coverage directory
      'coverage/',
      '*.lcov',
      '.nyc_output',

      // Cache directories
      '.eslintcache',
      '.cache',
      '.parcel-cache',

      // Temporary folders
      'tmp/',
      'temp/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      prettier,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn', // Changed from error to warn
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',

      // Prettier integration
      'prettier/prettier': 'error',

      // Import sorting - simplified to work with Prettier
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // React specific rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'off',

      // General code quality - relaxed for Prettier compatibility
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-multiple-empty-lines': 'off', // Let Prettier handle this
      'eol-last': 'off', // Let Prettier handle this
      'comma-dangle': 'off', // Let Prettier handle this
      quotes: 'off', // Let Prettier handle this
      semi: 'off', // Let Prettier handle this
      indent: 'off', // Let Prettier handle this
      'object-curly-spacing': 'off', // Let Prettier handle this
      'array-bracket-spacing': 'off', // Let Prettier handle this
      'comma-spacing': 'off', // Let Prettier handle this
      'key-spacing': 'off', // Let Prettier handle this
      'space-before-blocks': 'off', // Let Prettier handle this
      'space-before-function-paren': 'off', // Let Prettier handle this
      'space-in-parens': 'off', // Let Prettier handle this
      'space-infix-ops': 'off', // Let Prettier handle this
      'arrow-spacing': 'off', // Let Prettier handle this
      'keyword-spacing': 'off', // Let Prettier handle this
      'brace-style': 'off', // Let Prettier handle this
      curly: 'off', // Let Prettier handle this
      eqeqeq: 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'off',
      yoda: 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Disable JS rules that conflict with TypeScript
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  prettierConfig, // Must be last to override conflicting rules
]

