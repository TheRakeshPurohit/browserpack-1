import path from 'path';

export default function webWorkerPlugin() {
  const urlLoaderPrefix = 'web-worker:';

  return {
    name: 'web-worker-plugin',
    async resolveId(id, importer) {
      if (!id.startsWith(urlLoaderPrefix)) return;

      const workerFilePath = id.slice(urlLoaderPrefix.length);
      const resolved = await this.resolve(workerFilePath, importer);
      if (!resolved)
        throw Error(`Cannot find module '${workerFilePath}' from '${importer}'`);
      const newId = resolved.id;

      return urlLoaderPrefix + newId;
    },
    load(id) {
      if (!id.startsWith(urlLoaderPrefix)) return;

      const realId = id.slice(urlLoaderPrefix.length);
      const relativePath = path.relative(process.cwd(), realId);
      const fileName = `${relativePath.replace(/\//ig, "-")}.js`;

      this.emitFile({ id: realId, type: "chunk", fileName });

      const code = `
        export default function() {
          const webWorker = new Worker('/${fileName}');

          return webWorker;
        }
      `;

      return code;
    }
  } 
}
