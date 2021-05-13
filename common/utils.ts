import path from 'path';
import { Files } from './api';
import { resolveFile } from './resolver';

export function getFileExtension(filename: string) {
  const filenameParts = filename.split('.');

  if (filenameParts.length === 1) return '';

  return filenameParts[filenameParts.length - 1];
}

export function isExternalDep(dependency: string) {
  if (
    dependency.startsWith('.') ||
    dependency.startsWith('..') ||
    dependency.startsWith('/')
  ) {
    return false;
  } else {
    return true;
  }
}

export function resolveDepPath(
  files: Files,
  filePath: string,
  depRelativePath: string
) {
  const depAbsolutePath = isExternalDep(depRelativePath)
    ? `/node_modules/${depRelativePath}`
    : path.resolve(path.dirname(filePath), depRelativePath);

  return resolveFile(files, depAbsolutePath);
}

export function findRootPathOfPackage(filePath: string) {
  const filePathParts = filePath.split('/');
  let i;

  for (i = filePathParts.length; i >= 0; i--) {
    if (filePathParts[i] === 'node_modules') {
      break;
    }
  }

  // it is a scope package so we need another part in the path
  // @chakra-ui/core
  if (filePathParts[i + 1].startsWith('@')) {
    i++;
  }

  return filePathParts.slice(0, i + 2).join('/');
}

export function getExactPackageVersion(version: string) {
  if (version.startsWith('^') || version.startsWith('~')) {
    return version.substring(1);
  } else {
    return version;
  }
}
