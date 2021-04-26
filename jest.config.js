const jestConfig = {
  preset: 'ts-jest',
  moduleNameMapper: {
    "^web-worker:(.+)$": "<rootDir>/src/bundler/$1"
  },
  transform: {
    "^(.*)worker(.*)$": "<rootDir>/test/web-worker-transformer.js"
  },
  setupFiles: [
    "<rootDir>/test/setup.ts"
  ]
};

module.exports = jestConfig;
