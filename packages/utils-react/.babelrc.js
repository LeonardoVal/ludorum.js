const path = require('path');

module.exports = {
  extends: path.join(
    path.dirname(require.resolve('@creatartis/creatartis-build')),
    'babel-config.js',
  ),
  presets: [
    '@babel/preset-react',
  ],
};
