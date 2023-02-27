const path = require('path');

function jestConfig() {
  return {
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      'test/**/*.test.{js,jsx}',
    ],
    coverageDirectory: 'test/specs/coverage/',
    coverageReporters: [
      'json',
      'text-summary',
    ],
    rootDir: process.cwd(),
    setupFilesAfterEnv: [
      path.join(__dirname, 'jest-setup.js'),
    ],
    testPathIgnorePatterns: [
      'node_modules/',
      'src/',
      'dist/',
    ],
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    verbose: true,
  };
} // jestConfig

module.exports = jestConfig;
