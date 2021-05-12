const jestConfig = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^worker-loader!(.+)$': '<rootDir>/src/bundler/core/$1'
  },
  transform: {
    '^.+\\.worker.[t|j]sx?$': '<rootDir>/test/web-worker-transformer.js'
  }
};

module.exports = jestConfig;
