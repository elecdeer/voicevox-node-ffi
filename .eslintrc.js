module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external"],
          ["parent", "sibling", "index"],
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "@alias/**",
            group: "parent",
            position: "before",
          },
        ],
        alphabetize: {
          order: "asc",
        },
        "newlines-between": "always",
      },
    ],
  },
  ignorePatterns: ["tsup.config.ts", "dist", "eslintrc.js"],
};
