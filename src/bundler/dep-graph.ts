import { DepGraph, Files } from "./types";
import { createAsset } from "./utils";

export async function generateDepGraph(files: Files, entryPoint: string = '/index.js') {
  let importer = entryPoint;
  const queue = [importer];
  const depGraph: DepGraph = {};

  for (const filePath of queue) {
    const asset = await createAsset(filePath, importer, files);

    depGraph[filePath] = asset;
    importer = filePath;

    queue.push(...asset.dependencies);
  }

  return depGraph;
}
