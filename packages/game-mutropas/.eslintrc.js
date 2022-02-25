const path = require('path');

module.exports = {
  extends: path.join(
    path.dirname(require.resolve('@creatartis/creatartis-build')),
    'eslint-config.js',
  ),
  ignorePatterns: ['node_modules/', 'dist/'],
  rules: {
    'import/no-dynamic-require': 0,
    'no-await-in-loop': 0,
    'no-console': 0,
    'no-mixed-operators': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'no-unused-vars': 0,
  },
};
