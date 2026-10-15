module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'build', '.eslintrc.cjs', 'coverage', 'playwright-report', 'test-results'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // plain-JS project without the prop-types package; components take data straight from JSON
    'react/prop-types': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: [
        '**/*.test.{js,jsx}',
        'vitest.config.js',
        'vitest.setup.js',
        'src/test/**',
        'e2e/**',
        'playwright.config.js',
      ],
      env: { node: true, browser: true },
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
  ],
}
