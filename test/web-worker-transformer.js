const tsJest = require('ts-jest');
const fs = require('fs');
const path = require('path');

const webWorkerTemplatePath = path.join(
  __dirname,
  './web-worker-mock-template.js'
);
const webWorkerTemplate = fs.readFileSync(webWorkerTemplatePath, 'utf-8');
const tsJestTransformer = tsJest.createTransformer();

module.exports = {
  process(src, filename, config, options) {
    const transpiledCode = tsJestTransformer.process(
      src,
      `${filename}.ts`,
      config && config.globals
    );

    const code = webWorkerTemplate.replace('//worker-code', transpiledCode);

    return code;
  }
};
