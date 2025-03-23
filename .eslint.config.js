import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          paths: ['.'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      ...typescript.configs['recommended'].rules,
      ...prettier.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import/no-unresolved': 'error',
    },
  },
  {
    files: ['.eslintrc.{js,cjs}'],
    env: {
      node: true,
    },
    parserOptions: {
      sourceType: 'script',
    },
  },
];
