const path = require('path');

module.exports = {
  devServer: {
    open: true,
    port: 8000,
    static: [__dirname],
  },
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, 'index.jsx'),
  mode: 'development',
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.jsx?$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
        }
      },
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
};
