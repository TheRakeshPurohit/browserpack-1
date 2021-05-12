import BundlerWorker from 'worker-loader!./bundler.worker';
import { resolveFile } from './resolver';
import { BundlerWorkerMessage, DepGraph, Files } from '../types';
import path from 'path';
import { getFileExtension } from '../utils';
import assetCache from '../cache/asset-cache';
import moduleCache from '../cache/module-cache';

export interface BrowserPackConfig {
  files: Files;
  entryPoint?: string;
}

export default class Browserpack {
  private bundlerWorker: Worker;
  private depGraph: DepGraph;

  constructor(private config: BrowserPackConfig) {
    this.bundlerWorker = new BundlerWorker();
    this.depGraph = {};
  }

  private sendBundlerWorkerMessage(message: BundlerWorkerMessage) {
    this.bundlerWorker.postMessage(message);
  }

  private findAffectedFiles(filePath: string) {}

  bundle(): Promise<DepGraph> {
    assetCache.reset();

    return new Promise((resolve) => {
      const workerListener = (evt: MessageEvent<BundlerWorkerMessage>) => {
        if (evt.data.type === 'DEP_GRAPH_READY') {
          this.bundlerWorker.removeEventListener('message', workerListener);

          this.depGraph = evt.data.payload.depGraph;

          resolve(this.depGraph);
        } else if (evt.data.type === 'ERR') {
          throw evt.data.payload.err;
        }
      };

      this.bundlerWorker.addEventListener('message', workerListener);

      this.sendBundlerWorkerMessage({
        type: 'BUILD_DEP_GRAPH',
        payload: {
          files: this.config.files,
          entryPoint: this.config.entryPoint
        }
      });
    });
  }

  private runCode(filePath: string) {
    const fileExtension = getFileExtension(path.basename(filePath));
    const cachedModule = moduleCache.get(filePath);
    // require used inside transpiled code
    const process = {
      env: {
        NODE_ENV: 'development'
      }
    };
    const require = (relativePath: string) => {
      const absolutePath = path.join(path.dirname(filePath), relativePath);

      return this.runCode(
        resolveFile(this.config.files, absolutePath) as string
      );
    };
    const exports = {};
    const module = {
      exports
    };

    if (['js', 'json'].includes(fileExtension)) {
      if (cachedModule) return cachedModule;

      const asset = this.depGraph[filePath];

      if (asset.code) {
        eval(asset.code);
      }

      moduleCache.set(filePath, module.exports);

      return module.exports;
    } else if (fileExtension === 'css') {
      if (cachedModule) return;

      const asset = this.depGraph[filePath];
      const styleTag = document.createElement('style');

      styleTag.innerHTML = asset.code || '';
      document.head.append(styleTag);

      module.exports = styleTag;
      moduleCache.set(filePath, module.exports);

      return module.exports;
    }
  }

  run() {
    moduleCache.reset();

    this.runCode(this.config.entryPoint || '/index.js');
  }

  async update(files: Files) {
    this.config.files = { ...this.config.files, ...files };
    moduleCache.reset();

    await this.bundle();

    this.run();
  }
}
