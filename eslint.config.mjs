import eslint from '@eslint/js';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  }
);
