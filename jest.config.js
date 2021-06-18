const tsconfig = require('./tsconfig.json');
const tsconfigPathsMapper = require('tsconfig-paths-jest')(tsconfig);

const jestConfig = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^worker-loader!(.+)$': '<rootDir>/bundler/core/$1',
    ...tsconfigPathsMapper
  },
  transform: {
    '^.+\\.worker.[t|j]sx?$': '<rootDir>/test/web-worker-transformer.js'
  },
  setupFiles: ['<rootDir>/test/setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/app']
};

module.exports = jestConfig;
