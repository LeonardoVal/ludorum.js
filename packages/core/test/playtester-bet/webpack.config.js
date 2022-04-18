const path = require('path');

module.exports = {
  devServer: {
    open: true,
    port: 8000,
    static: [__dirname],
  },
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, 'index.js'),
  mode: 'development',
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
};
