import path from 'path';
import { Files, ProjectTemplate, ProjectTemplateDefintion } from './api';
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

export function detectTemplate(files: Files): ProjectTemplate {
  const packageJSON = getPackageJSON(files);
  const dependencies = packageJSON.dependencies || {};

  if (dependencies['react']) return 'react';
  else if (dependencies['@angular/core']) return 'angular';
  else return 'vanilla';
}

export function getPackageJSON(files: Files, filePath = '/') {
  const packageJSONPath = path.resolve(filePath, 'package.json');
  const packageJSONStr = files[packageJSONPath]?.content || '{}';

  return JSON.parse(packageJSONStr);
}

export function getProjectTemplateDefintion(
  files: Files
): ProjectTemplateDefintion {
  const template = detectTemplate(files);

  switch (template) {
    case 'react': {
      return {
        htmlEntry: '/public/index.html',
        entry: '/src/index.js'
      };
    }
    case 'angular': {
      return {
        htmlEntry: '/src/index.html',
        entry: '/src/main.ts'
      };
    }
    default: {
      return {
        htmlEntry: '/index.html',
        entry: '/index.js'
      };
    }
  }
}
