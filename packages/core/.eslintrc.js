const eslintConfig = require('@ludorum/common-dev/config/eslintrc');

module.exports = (() => {
  const config = eslintConfig();
  return {
    ...config,
    // Override the default configuration here.
  };
})();
