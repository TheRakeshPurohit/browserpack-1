import { Files } from '@common/api';
import {
  findRootPathOfPackage,
  getFileExtension,
  isExternalDep
} from '@common/utils';
import path from 'path';

const extensions = ['js', 'ts'];

export function resolveFile(
  files: Files,
  depPath: string,
  importerPath: string = '/'
) {
  const absoluteFilePath = (() => {
    if (isExternalDep(depPath)) {
      const packageRootPath = findRootPathOfPackage(importerPath);

      return `${packageRootPath}/node_modules/${depPath}`;
    } else {
      return path.resolve('/', path.dirname(importerPath), depPath);
    }
  })();
  const filename = path.basename(absoluteFilePath);
  const extension = getFileExtension(filename);

  if (extension) {
    if (files[absoluteFilePath]) return absoluteFilePath;
  } else {
    for (const extension of extensions) {
      const dependencyWithExtension = `${absoluteFilePath}.${extension}`;
      if (files[dependencyWithExtension]) {
        return dependencyWithExtension;
      }
    }

    for (const extension of extensions) {
      const indexFileWithExtension = `${absoluteFilePath}/index.${extension}`;

      if (files[indexFileWithExtension]) {
        return indexFileWithExtension;
      }
    }

    const packageJSONContent = (() => {
      const asset = files[`${absoluteFilePath}/package.json`];

      if (!asset) return null;

      return asset.content;
    })();

    if (packageJSONContent) {
      try {
        const packageJSON = JSON.parse(packageJSONContent);
        const mainFile = packageJSON.main;
        const mainFilePath = path.join(absoluteFilePath, mainFile);

        if (mainFile && files[mainFilePath]) {
          return mainFilePath;
        }
      } catch {
        throw new Error(
          `invalid json found in ${absoluteFilePath}/package.json`
        );
      }
    }
  }

  return null;
}
