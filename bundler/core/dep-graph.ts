import { DepGraph, Files } from '@common/api';
import { createAsset } from '../utils';
import path from 'path';
import { resolveFile } from './resolver';
import assetCache from '../cache/asset-cache';

export function generateDepGraph(
  files: Files,
  entryPoint: string = '/index.js'
) {
  let importer = entryPoint;
  const queue = [importer];
  const depGraph: DepGraph = {};

  for (const filePath of queue) {
    const resolvedFilePath = resolveFile(files, filePath);

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
    importer = filePath;

    // get the absolute path of the dependency
    const dependencies = asset.dependencies.map((dependency) =>
      path.resolve(path.dirname(filePath), dependency)
    );

    queue.push(...dependencies);
  }

  return depGraph;
}
