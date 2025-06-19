const { FlatCompat } = require("@eslint/eslintrc");
const { configs } = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: configs.recommended,
});

module.exports = [
  ...compat.config(require("./.eslintrc.cjs")),
  {
    ignores: [
      "coverage/",
      "dist/",
      "build/",
      "node_modules/",
      "assets/",
      "*.test.tsx",
      ".eslintrc.cjs",
      "sw.js",
      "workbox-5ffe50d4.js",
    ],
  },
];
