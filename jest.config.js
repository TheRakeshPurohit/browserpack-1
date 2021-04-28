const jestConfig = {
  preset: 'ts-jest',
  moduleNameMapper: {
    "^web-worker:(.+)$": "<rootDir>/src/bundler/$1"
  },
  transform: {
    "^.+\\.worker.[t|j]sx?$": "<rootDir>/test/web-worker-transformer.js"
  }
};

module.exports = jestConfig;
