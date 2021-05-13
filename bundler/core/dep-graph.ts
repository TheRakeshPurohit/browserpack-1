import { DepGraph, Files } from '@common/api';
import { createAsset } from '../utils';
import { resolveFile } from '@common/resolver';
import assetCache from '../cache/asset-cache';
import { isExternalDep } from '@common/utils';

export async function generateDepGraph(
  files: Files,
  entryPoint: string = '/index.js'
) {
  const queue = [{ importer: entryPoint, filePath: entryPoint }];
  const depGraph: DepGraph = {};

  for (const elem of queue) {
    const { importer, filePath } = elem;
    // we will install packages later
    if (isExternalDep(filePath)) continue;

    const resolvedFilePath = resolveFile(files, filePath, importer);

    if (!resolvedFilePath) {
      throw new Error(`Cannot find module '${filePath}' from '${importer}'`);
    }

    const asset = (() => {
      if (!assetCache.get(resolvedFilePath)) {
        const asset = createAsset(resolvedFilePath, importer, files);

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

  return depGraph;
}
