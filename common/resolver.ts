import { Files } from '@common/api';
import { isExternalDep } from '@common/utils';
import path from 'path';

const extensions = ['js', 'ts'];

export function resolveFile(
  files: Files,
  depPath: string,
  importerPath: string = '/'
) {
  if (isExternalDep(depPath)) return depPath;

  const absoluteFilePath = path.resolve(
    '/',
    path.dirname(importerPath),
    depPath
  );

  if (files[absoluteFilePath]) return absoluteFilePath;

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
      throw new Error(`invalid json found in ${absoluteFilePath}/package.json`);
    }
  }

  return null;
}
