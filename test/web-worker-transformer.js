const tsJest = require('ts-jest');

const tsJestTransformer = tsJest.createTransformer();

module.exports = {
  process(src, filename, config, options) {
    const transpiledCode = tsJestTransformer.process(src, `${filename}.ts`, config && config.globals);

    const code = `
      module.exports = function() {
        const webWorker = new Worker(URL.createObjectURL(new Blob([\`${transpiledCode}\`])));

        return webWorker;
      }
    `;

    return code;
  },
};
