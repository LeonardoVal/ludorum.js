const jestConfig = require('@ludorum/common-dev/config/jest.config');

module.exports = (() => {
  const config = jestConfig();
  return {
    ...config,
  };
})();
