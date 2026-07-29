import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    plugins: {
      unicorn,
    },
    rules: {
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
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/service-worker.js',
    'dist/**',
    '*.config.js',
    '*.config.ts',
  ]),
]);