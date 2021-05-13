import { getPackageFiles } from './npm';
import path from 'path';
import { DepGraph } from '@common/api';
import { createAsset } from './utils';
import { findRootPathOfPackage } from '@common/utils';
import { resolveFile } from '@common/resolver';

export async function generateDepGraph(
  packageName: string,
  packageVersion: string
) {
  const files = await getPackageFiles(packageName, packageVersion);
  const packagePath = `/node_modules/${packageName}`;
  const packageJSON = JSON.parse(
    files[`${packagePath}/package.json`].content || '{}'
  );
  const entryPoint = packageJSON.main || '/index.js';
  const entryPointPath = path.join(packagePath, entryPoint);
  const queue = [entryPointPath];
  const depGraph: DepGraph = {};

  for (const filePath of queue) {
    if (depGraph[filePath]) continue;

    const asset = await createAsset(files, filePath);

    if (!asset) continue;

    depGraph[filePath] = asset;

    // add package.json to also dependency graph to help resolution
    const packageRootPath = findRootPathOfPackage(filePath);
    const packageJSONPath = `${packageRootPath}/package.json`;

    if (!depGraph[packageJSONPath]) {
      depGraph[packageJSONPath] = {
        code: files[packageJSONPath].content || '{}',
        dependencies: []
      };
    }

    // if we are not able to resolve a file, then may be it is a peer dependency so we ignore it
    const dependencies = asset.dependencies
      .map((dependency) => resolveFile(files, dependency, filePath) as string)
      .filter(Boolean);

    queue.push(...dependencies);
  }

  return depGraph;
}
