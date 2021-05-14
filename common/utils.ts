import path from 'path';
import { Files } from './api';
import { resolveFile } from './resolver';
import { ClientMessage } from '@common/api';

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

export function getPackageNameFromPath(filePath: string) {
  const fileParts = filePath.split('/');

  if (fileParts[0].startsWith('@')) {
    return `${fileParts[0]}/${fileParts[1]}`;
  } else {
    return fileParts[0];
  }
}

export function sendMessageFromPreview(message: ClientMessage) {
  window.parent.postMessage(message, '*');
}

export function sendMessageFromClient(
  iframe: HTMLIFrameElement,
  message: ClientMessage
) {
  iframe.contentWindow?.postMessage(message, '*');
}

export function listenForWindowMessage(
  cb: (message: MessageEvent<ClientMessage>) => void
) {
  window.addEventListener('message', cb);

  return () => window.removeEventListener('message', cb);
}
