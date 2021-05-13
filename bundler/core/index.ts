import BundlerWorker from 'worker-loader!./bundler.worker';
import { resolveFile } from '../../common/resolver';
import { BundlerWorkerMessage, DepGraph, Files } from '@common/api';
import path from 'path';
import { getFileExtension } from '@common/utils';
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

  private findDependents(filePath: string) {
    const dependents: string[] = [];
    const queue = [filePath];

    for (const elem of queue) {
      for (const assetPath in this.depGraph) {
        for (const dependency of this.depGraph[assetPath].dependencies) {
          const dependencyAbsolutePath = path.resolve(
            path.dirname(assetPath),
            dependency
          );
          const resolvedFilePath = resolveFile(
            this.config.files,
            dependencyAbsolutePath
          );

          if (resolvedFilePath === elem) {
            const dependent = resolveFile(
              this.config.files,
              assetPath
            ) as string;

            dependents.push(dependent);
            // now we need fnd dependents of the dependent :)
            queue.push(dependent);
          }
        }
      }
    }

    return dependents;
  }

  bundle(invalidateFiles: string[] = []): Promise<DepGraph> {
    if (invalidateFiles.length === 0) {
      moduleCache.reset();
    } else {
      for (const file of invalidateFiles) {
        moduleCache.remove(file);
      }
    }

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
          entryPoint: this.config.entryPoint,
          invalidateFiles
        }
      });
    });
  }

  private findRemovedFiles(prevDepGraph: DepGraph) {
    const removedFiles = [];

    for (const file in prevDepGraph) {
      if (!this.depGraph[file]) removedFiles.push(file);
    }

    return removedFiles;
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

      styleTag.setAttribute('id', filePath);
      styleTag.innerHTML = asset.code || '';
      document.head.append(styleTag);

      module.exports = styleTag;
      moduleCache.set(filePath, module.exports);

      return module.exports;
    }
  }

  run() {
    this.runCode(this.config.entryPoint || '/index.js');
  }

  undoRun(filePath: string) {
    const fileExtension = getFileExtension(path.basename(filePath));

    if (fileExtension === 'css') {
      const styleTag = moduleCache.get(filePath) as HTMLStyleElement;

      if (styleTag) {
        styleTag.remove();
      }
    }
  }

  async update(files: Files) {
    this.config.files = { ...this.config.files, ...files };

    const prevDepGraph = this.depGraph;
    const filesToInvalidate = [];

    for (const file in files) {
      filesToInvalidate.push(file, ...this.findDependents(file));
    }

    // now we will transpile and run only affected files and files that depend on the updated files
    await this.bundle([...filesToInvalidate]);

    const removedFiles = this.findRemovedFiles(prevDepGraph);

    for (const removedFile of removedFiles) {
      this.undoRun(removedFile);
    }

    this.run();
  }
}
