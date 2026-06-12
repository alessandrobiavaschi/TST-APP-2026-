import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // Config per file di build/config Node (non React)
  {
    files: ['vite.config.js', 'postcss.config.js', 'eslint.config.js', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  // Config principale per sorgenti React
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Ignora variabili/argomenti prefissati con _
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Consenti export di utility note accanto ai componenti (ResultsPage, auth.js)
      'react-refresh/only-export-components': [
        'warn',
        {
          allowExportNames: [
            'computeAgeFromBirthDate',
            'getPortatoDominant',
            'FioreMood',
            'GOOGLE_AUTH_DIAGNOSTIC_EVENT',
          ],
        },
      ],
      // react-hooks v7: setState in useEffect è un warning per pattern legittimi
      // (hydration da localStorage, sync con deps esterne) — abbassato a warn
      'react-hooks/react-compiler': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
