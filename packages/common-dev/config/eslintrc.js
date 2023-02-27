function eslintConfig() {
  return {
    env: {
      browser: true,
      es6: true,
      'jest/globals': true,
    },
    extends: [
      'airbnb',
    ],
    globals: {
      document: 'readonly',
      window: 'readonly',
    },
    ignorePatterns: [
      'dist/',
      'docs/jsdoc/',
      'node_modules/',
    ],
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 2022,
    },
    plugins: [
      'jest',
    ],
    rules: {
      'function-paren-newline': 'off',
      'no-mixed-operators': 'off',
      'no-nested-ternary': 'off',
      'no-restricted-syntax': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
      }],
    },
  };
}

module.exports = eslintConfig;
