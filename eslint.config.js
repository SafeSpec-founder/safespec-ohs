const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
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
