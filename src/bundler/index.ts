import BundlerWorker from 'worker-loader!./bundler.worker';
import { BundlerWorkerMessage, DepGraph, Files } from './types';

export interface BrowserPackConfig {
  files: Files;
  entryPoint?: string;
}

export default class Browserpack {
  private bundlerWorker: Worker;

  constructor(private config: BrowserPackConfig) {
    this.config.entryPoint = this.config.entryPoint || '/index.js';
    this.bundlerWorker = new BundlerWorker();
  }

  private sendBundlerWorkerMessage(message: BundlerWorkerMessage) {
    this.bundlerWorker.postMessage(message);
  }

  bundle(): Promise<DepGraph> {
    return new Promise((resolve) => {
      const workerListener = (evt: MessageEvent<BundlerWorkerMessage>) => {
        if (evt.data.type === 'DEP_GRAPH_READY') {
          this.bundlerWorker.removeEventListener('message', workerListener);

          resolve(evt.data.payload.depGraph);
        } else if (evt.data.type === 'ERR') {
          throw evt.data.payload.err;
        }
      }

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

  run() {
    console.log('running bundler...');
  }
}
