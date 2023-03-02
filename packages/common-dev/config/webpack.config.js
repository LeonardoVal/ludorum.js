function webpackConfig({ packageJSON }) {
  const packageName = packageJSON.name.replace(/^(@[^/]+\/)?/, '');
  const packageDeps = [
    ...Object.keys(packageJSON.dependencies),
    ...Object.keys(packageJSON.devDependencies),
  ];
  return {
    devtool: 'source-map',
    externals: [
      ({ context, request }, callback) => {
        const requestPackage = packageDeps.find((dep) => request.startsWith(dep));
        if (requestPackage) {
          if (requestPackage !== request) {
            // eslint-disable-next-line no-console
            console.warn(`Warning: importing '${request}' at ${
              context} may fail if the package ${requestPackage} is bundled.`);
          }
          return callback(null, request);
        }
        return callback();
      },
    ],
    mode: 'production',
    module: {
      rules: [{
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      }],
    },
    output: {
      filename: `${packageName}.js`,
      library: packageName,
      libraryTarget: 'umd',
      // Workaround of a webpack bug: <https://github.com/webpack/webpack/issues/6784>.
      globalObject: 'typeof self !== \'undefined\' ? self : this',
    },
  };
} // function webpackConfig

module.exports = webpackConfig;
