import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            props: false,
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
  ...compat.extends('eslint:recommended'),
  ...compat.extends('next/typescript'),
  ...compat.extends('next/core-web-vitals'),
];

export default eslintConfig;
