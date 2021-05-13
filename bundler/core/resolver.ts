import { Files } from '@common/api';
import { getFileExtension } from '@common/utils';
import path from 'path';

const extensions = ['js', 'ts'];

export function resolveFile(files: Files, filePath: string) {
  const filename = path.basename(filePath);
  const extension = getFileExtension(filename);

  if (extension) {
    if (files[filePath]) return filePath;
  } else {
    for (const extension of extensions) {
      const dependencyWithExtension = `${filePath}.${extension}`;
      if (files[dependencyWithExtension]) {
        return dependencyWithExtension;
      }
    }

    for (const extension of extensions) {
      const indexFileWithExtension = `${filePath}/index.${extension}`;

      if (files[indexFileWithExtension]) {
        return indexFileWithExtension;
      }
    }

    const packageJSONContent = (() => {
      const asset = files[`${filePath}/package.json`];

      if (!asset) return null;

      return asset.content;
    })();

    if (packageJSONContent) {
      try {
        const packageJSON = JSON.parse(packageJSONContent);
        const mainFile = packageJSON.main;
        const mainFilePath = path.join(filePath, mainFile);

        if (mainFile && files[mainFilePath]) {
          return mainFilePath;
        }
      } catch {
        throw new Error(`invalid json found in ${filePath}/package.json`);
      }
    }
  }

  return null;
}
