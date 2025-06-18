/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.eslint.json",
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-warning-comments": "off",
    "no-useless-catch": "off",
    "react-hooks/exhaustive-deps": [
      "warn",
      { additionalHooks: "(useCustomHook)" },
    ],
    "react/no-unescaped-entities": "off",
    quotes: "off", // Disable quote enforcement
    "comma-dangle": "off", // Disable trailing comma enforcement
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
  ignorePatterns: [
    "coverage/",
    "dist/",
    "build/",
    "node_modules/",
    "assets/",
    "*.test.tsx",
    ".eslintrc.cjs",
  ],
};
