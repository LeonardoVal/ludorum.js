const webpackConfig = require('@ludorum/common-dev/config/webpack.config');
const packageJSON = require('./package.json');

module.exports = (() => {
  const config = webpackConfig({ packageJSON });
  return {
    ...config,
  };
})();
