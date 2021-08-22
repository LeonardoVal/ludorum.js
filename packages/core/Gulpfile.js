// eslint-disable-next-line import/no-extraneous-dependencies
const build = require('@creatartis/creatartis-build');
const packageJSON = require('./package.json');

Object.assign(exports, build.tasks({
  packageJSON,
}));
