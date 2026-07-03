import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import globals from 'globals';

/**
 * Flat ESLint config. Intentionally light for the MVP: lint new code in `src/`,
 * and don't fight the legacy design bundle (it predates the lint rules and is
 * migrated away screen-by-screen). `tsc --noEmit` provides type-level checking.
 */
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'src/legacy/**', 'supabase/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
  },
);
