import { DepGraph, Files } from "./types";
import { createAsset } from "./utils";
import path from 'path';

export function generateDepGraph(files: Files, entryPoint: string = '/index.js') {
  let importer = entryPoint;
  const queue = [importer];
  const depGraph: DepGraph = {};

  for (const filePath of queue) {
    // we have already created asset for this file so ignore
    if (depGraph[filePath]) continue;

    const asset = createAsset(filePath, importer, files);

    depGraph[filePath] = asset;
    importer = filePath;

    // get the absolute path of the dependency
    const dependencies = asset.dependencies.map(dependency => path.resolve(path.dirname(filePath), dependency));

    queue.push(...dependencies);
  }

  return depGraph;
}
