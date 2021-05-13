import path from 'path';
import decompress from 'decompress';
import 'isomorphic-fetch';
import { Files } from '@common/api';

export async function getPackageFiles(
  name: string,
  version: string,
  rootPath = '/node_modules'
) {
  const npmResponse = await fetch(
    `https://registry.npmjs.org/${name}/${version}`
  );

  if (npmResponse.ok) {
    const packageInfo = await npmResponse.json();
    const tarballURL = packageInfo.dist.tarball;
    const tarballBuffer = Buffer.from(
      await (await fetch(tarballURL)).arrayBuffer()
    );
    const packageFilesJSON: Files = {};

    const packageFiles = await decompress(tarballBuffer);

    for (const packageFile of packageFiles) {
      const packageRelativePath = path.relative('package', packageFile.path);
      const packageNodeModulesPath = path.join(
        `${rootPath}/${name}`,
        packageRelativePath
      );

      packageFilesJSON[packageNodeModulesPath] = {
        content: packageFile.data.toString('utf-8')
      };
    }

    return packageFilesJSON;
  } else {
    throw npmResponse.statusText;
  }
}
