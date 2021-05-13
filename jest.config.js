const jestConfig = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^worker-loader!(.+)$': '<rootDir>/bundler/core/$1',
    '@common': '<rootDir>/common/$1'
  },
  transform: {
    '^.+\\.worker.[t|j]sx?$': '<rootDir>/test/web-worker-transformer.js'
  }
};

module.exports = jestConfig;
