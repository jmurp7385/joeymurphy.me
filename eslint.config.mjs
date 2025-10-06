import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  ...compat.extends('eslint:recommended'),
  ...compat.extends('next/typescript'),
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('prettier'),
];

export default eslintConfig;
