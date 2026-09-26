import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier'

/**
 * MATHEON — konfiguracja ESLint (flat config, ESLint 9+).
 *
 * Baza: `eslint-config-next/core-web-vitals` (Next, React Hooks, a11y, TS),
 * na końcu `eslint-config-prettier`, żeby stylistyka nie kłóciła się z Prettier.
 *
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      'pnpm-lock.yaml',
      'public/sw.js',
      'public/icons/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    /*
     * Baseline istniejącego kodu (wzorzec „dane w effect” jest w całej aplikacji).
     * Naprawa = przepisanie na server components / loadery — osobny krok z Fazy 6.
     * Nowe pliki powinny unikać synchronicznych setState w efektach.
     */
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  prettier,
]

export default config
