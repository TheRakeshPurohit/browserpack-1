import { DepGraph, Files } from '@common/api';
import { createAsset, findRemovedFiles } from '../utils';
import { resolveFile } from '@common/resolver';
import assetCache from '../cache/asset-cache';

export async function generateDepGraph(
  files: Files,
  entryPoint: string = '/index.js'
) {
  const queue = [{ importer: entryPoint, filePath: entryPoint }];
  const depGraph: DepGraph = {};

  for (const elem of queue) {
    const { importer, filePath } = elem;
    const resolvedFilePath = resolveFile(files, filePath, importer);

    if (!resolvedFilePath) {
      throw new Error(`Cannot find module '${filePath}' from '${importer}'`);
    }

    const asset = await (async () => {
      if (!assetCache.get(resolvedFilePath)) {
        const asset = await createAsset(resolvedFilePath, importer, files);

        if (asset) assetCache.set(resolvedFilePath, asset);
        else
          throw new Error(
            `No handler found for file ${filePath} imported from ${importer}`
          );
      }

      return assetCache.get(resolvedFilePath);
    })();

    depGraph[resolvedFilePath] = asset;
    const dependencies = asset.dependencies.map((dependency) => ({
      filePath: dependency,
      importer: filePath
    }));

    queue.push(...dependencies);
  }

  const removedFiles = findRemovedFiles(assetCache.depGraph, depGraph);

  for (const removedFile of removedFiles) {
    assetCache.remove(removedFile);
  }

  return depGraph;
}
