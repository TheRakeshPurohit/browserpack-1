import BundlerWorker from 'worker-loader!./bundler.worker';
import { resolveFile } from '@common/resolver';
import {
  BundlerWorkerMessage,
  DepGraph,
  Files,
  ProjectTemplateDefintion
} from '@common/api';
import path from 'path';
import {
  getFileExtension,
  getPackageNameFromPath,
  getProjectTemplateDefintion,
  isExternalDep
} from '@common/utils';
import moduleCache from '../cache/module-cache';
import { findRemovedFiles, getHTMLParts } from '../utils';

export interface BrowserPackConfig {
  files: Files;
  entryPoint?: string;
}

export default class Browserpack {
  private bundlerWorker: Worker;
  private depGraph: DepGraph;
  private templateDefintion: ProjectTemplateDefintion;

  constructor(private config: BrowserPackConfig) {
    this.bundlerWorker = new BundlerWorker();
    this.depGraph = {};
    this.templateDefintion = getProjectTemplateDefintion(config.files);
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

  private async installPackage(
    packageName: string,
    version: string
  ): Promise<DepGraph> {
    const packagerResponse = await fetch(
      `${process.env.PACKAGER_URL}/pack/${packageName}/${version}`
    );

    if (packagerResponse.ok) {
      return (await packagerResponse.json()).assets;
    } else {
      throw new Error(`Failed to install package ${packageName}@${version}`);
    }
  }

  private async installPackages() {
    for (const dep in this.depGraph) {
      if (isExternalDep(dep)) {
        const depPackageName = getPackageNameFromPath(dep);
        const packageJSON = JSON.parse(
          this.config.files[`/package.json`]?.content || '{}'
        );
        const packageDependencies = packageJSON.dependencies || {};
        const packageVersion = packageDependencies[depPackageName];
        const depPath = dep.substr(depPackageName.length + 1);
        const cdnPath = `https://cdn.skypack.dev/${depPackageName}@${packageVersion}/${depPath}`;
        const module = await import(/* webpackIgnore: true */ cdnPath);

        this.depGraph[dep].code = module;
      }
    }
  }

  private async generateDepGraph(invalidateFiles: string[] = []) {
    if (invalidateFiles.length === 0) {
      moduleCache.reset();
    } else {
      for (const file of invalidateFiles) {
        moduleCache.remove(file);
      }
    }

    return new Promise((resolve, reject) => {
      const workerListener = (evt: MessageEvent<BundlerWorkerMessage>) => {
        if (evt.data.type === 'DEP_GRAPH_READY') {
          this.bundlerWorker.removeEventListener('message', workerListener);

          this.depGraph = evt.data.payload.depGraph;

          resolve(this.depGraph);
        } else if (evt.data.type === 'ERR') {
          reject(evt.data.payload.err);
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

  async bundle(invalidateFiles: string[] = []): Promise<DepGraph> {
    await this.generateDepGraph(invalidateFiles);
    await this.installPackages();

    return this.depGraph;
  }

  private findRemovedFiles(prevDepGraph: DepGraph) {
    return findRemovedFiles(prevDepGraph, this.depGraph);
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
    const rawRequire = (relativePath: string) => {
      const resolvedFilePath = resolveFile(
        this.config.files,
        relativePath,
        filePath
      );

      if (!resolvedFilePath) {
        throw new Error(
          `Cannot find module '${relativePath}' from '${filePath}'`
        );
      }

      return this.config.files[resolvedFilePath].content;
    };
    const require = (relativePath: string) => {
      const resolvedFilePath = resolveFile(
        this.config.files,
        relativePath,
        filePath
      );

      if (!resolvedFilePath) {
        throw new Error(
          `Cannot find module '${relativePath}' from '${filePath}'`
        );
      }

      if (isExternalDep(resolvedFilePath)) {
        return this.depGraph[resolvedFilePath].code;
      }

      return this.runCode(resolvedFilePath);
    };
    const exports = {};
    const module = {
      exports
    };

    if (['js', 'json', 'ts'].includes(fileExtension)) {
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
    const htmlEntry = this.templateDefintion.htmlEntry;

    if (this.config.files[htmlEntry]?.content) {
      const { head, body } = getHTMLParts(
        this.config.files[htmlEntry]?.content
      );

      document.head.innerHTML = head;
      document.body.innerHTML = body;
    }

    this.runCode(this.config.entryPoint || this.templateDefintion.entry);
  }

  undoRun(filePath: string) {
    const fileExtension = getFileExtension(path.basename(filePath));

    if (fileExtension === 'css') {
      const styleTag = moduleCache.get(filePath) as HTMLStyleElement;

      if (styleTag) {
        styleTag.remove();
      }
    }

    moduleCache.remove(filePath);
  }

  async update(files: Files) {
    this.config.files = { ...this.config.files, ...files };

    const prevDepGraph = this.depGraph;
    // const filesToInvalidate = [];

    // for (const file in files) {
    //   filesToInvalidate.push(file, ...this.findDependents(file));
    // }

    // now we will transpile and run only affected files and files that depend on the updated files
    // await this.bundle([...filesToInvalidate]);
    await this.bundle();

    const removedFiles = this.findRemovedFiles(prevDepGraph);

    for (const removedFile of removedFiles) {
      this.undoRun(removedFile);
    }

    this.run();
  }
}
