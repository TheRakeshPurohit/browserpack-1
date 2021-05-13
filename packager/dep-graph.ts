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
    const npmPackagePackageJSONPath = `${packageRootPath}/package.json`;

    if (!depGraph[npmPackagePackageJSONPath]) {
      depGraph[npmPackagePackageJSONPath] = {
        code: files[npmPackagePackageJSONPath].content || '{}',
        dependencies: []
      };
    }

    const dependencies = asset.dependencies.map(
      (dependency) => resolveFile(files, filePath, dependency) as string
    );

    queue.push(...dependencies);
  }

  return depGraph;
}
