module.exports = {
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
      env: {
        es6: true,
        browser: true,
        es6: true,
        jest: true,
        node: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        "prettier/prettier": [
          "error",
          {
            endOfLine: "auto",
            semi: false,
            singleQuote: false,
          },
        ],
        "no-console": "warn",
      },
    },
  ],
}
