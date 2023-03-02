function jsdocConfig() {
  return {
    opts: {
      template: 'templates/default',
      encoding: 'utf8',
      recurse: true,
      destination: './docs/jsdoc',
    },
    plugins: [
      'plugins/markdown',
    ],
    recurseDepth: 10,
    source: {
      exclude: [
        'node_modules/',
        'dist/',
      ],
      includePattern: /.+\.js(doc|x)?$/,
      excludePattern: /(^|\/|\\)_/,
    },
    sourceType: 'script',
    tags: {
      allowUnknownTags: true,
      dictionaries: ['jsdoc', 'closure'],
    },
    templates: {
      cleverLinks: false,
      monospaceLinks: false,
    },
  };
}

module.exports = jsdocConfig;
