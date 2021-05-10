import BundlerWorker from 'worker-loader!./bundler.worker';
import { resolveFile } from './resolver';
import { BundlerWorkerMessage, DepGraph, Files } from './types';
import path from 'path';
import { getFileExtension } from './utils';

export interface BrowserPackConfig {
  files: Files;
  entryPoint?: string;
}

export default class Browserpack {
  private bundlerWorker: Worker;
  private depGraph: DepGraph;
  private moduleCache: Record<string, object>;

  constructor(private config: BrowserPackConfig) {
    this.bundlerWorker = new BundlerWorker();
    this.depGraph = {};
    this.moduleCache = {};
  }

  private sendBundlerWorkerMessage(message: BundlerWorkerMessage) {
    this.bundlerWorker.postMessage(message);
  }

  bundle(): Promise<DepGraph> {
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

    if (['js'].includes(fileExtension)) {
      if (this.moduleCache[filePath]) {
        return this.moduleCache[filePath];
      }

      const asset = this.depGraph[filePath];

      if (asset.code) {
        eval(asset.code);
      }

      this.moduleCache[filePath] = module.exports;

      return module.exports;
    } else if (['css'].includes(fileExtension)) {
      if (this.moduleCache[filePath]) return;

      const asset = this.depGraph[filePath];
      const styleTag = document.createElement('style');

      styleTag.innerText = asset.code || '';
      document.head.append(styleTag);

      return {};
    }
  }

  run() {
    this.runCode(this.config.entryPoint || '/index.js');
  }
}
