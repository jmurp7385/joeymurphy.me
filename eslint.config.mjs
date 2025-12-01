import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/service-worker.js',
      'dist/',
      '*.config.js',
      '*.config.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
      },
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: '.',
      },
    },
    plugins: {
      unicorn: (await import('eslint-plugin-unicorn')).default,
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin'))
        .default,
      react: (await import('eslint-plugin-react')).default,
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
    },
    rules: {
      // Next.js rules
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Unicorn rules
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            props: false,
            prop: false,
            params: false,
            args: false,
            ref: false,
            refs: false,
            env: false,
          },
        },
      ],
    },
  },
];
