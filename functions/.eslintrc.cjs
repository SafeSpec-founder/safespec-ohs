/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error', // Enforce Prettier rules via ESLint
    indent: 'off', // Disable ESLint's indentation rule
    quotes: 'off', // Disable ESLint's quotes rule
    'no-unused-vars': ['warn'], // Warn about unused variables
    semi: 'off', // Disable ESLint's semicolon rule
    'max-len': 'off', // Disable ESLint's max line length rule
  },
};
