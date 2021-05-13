import { DepGraph, Files } from '@common/api';
import { createAsset } from '../utils';
import { resolveFile } from '@common/resolver';
import assetCache from '../cache/asset-cache';

async function installPackage(packageName: string, version: string) {
  const packagerResponse = await fetch(
    `${process.env.PACKAGER_URL}/pack/${packageName}/${version}`
  );

  if (packagerResponse.ok) {
  } else {
    throw new Error(`Failed to install package ${packageName}@${version}`);
  }
}

async function installPackages(files: Files) {
  const packageJSONContent = files['/package.json']?.content || '{}';

  try {
    const packageJSON = JSON.parse(packageJSONContent);
    const dependencies = packageJSON.dependencies || {};

    for (const packageName in dependencies) {
      await installPackage(packageName, dependencies[packageName]);
    }
  } catch {
    throw new Error(`Invalid json file at /package.json`);
  }
}

export async function generateDepGraph(
  files: Files,
  entryPoint: string = '/index.js'
) {
  let importer = entryPoint;
  const queue = [importer];
  const depGraph: DepGraph = {};

  await installPackages(files);

  for (const filePath of queue) {
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
    importer = filePath;

    queue.push(...asset.dependencies);
  }

  return depGraph;
}
