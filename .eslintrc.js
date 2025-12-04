module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "prettier",
    "plugin:cypress/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./ui/tsconfig.json"],
  },
  plugins: ["react", "@typescript-eslint"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // don't require components to define prop types
    "react/prop-types": "off",
    // don't require components to have a display name
    "react/display-name": "off",
    // https://dev.to/wkrueger/never-ignore-the-exhaustive-deps-rule-2ap8
    "react-hooks/exhaustive-deps": "error",
    // Allow unused vars with underscore prefix
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
  },
};
