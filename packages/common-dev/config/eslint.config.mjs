import globals from "globals";
import js from "@eslint/js";

export function eslintConfig() {
  return [
    js.configs.recommended,
    {
      languageOptions: {
        ecmaVersion: 'latest',
        globals: globals.browser,
        sourceType: 'module',
      },
      rules: {
        'class-methods-use-this': 'off',
        'function-paren-newline': 'off',
        'import/prefer-default-export': 'off',
        'max-classes-per-file': 'off',
        'no-await-in-loop': 'off',
        'no-mixed-operators': 'off',
        'no-nested-ternary': 'off',
        'no-restricted-syntax': 'off',
        'no-underscore-dangle': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    { // Has to be on its own: <https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores>
      ignores: [
        'dist/',
      ],
    },
  ];
} // function eslintConfig
