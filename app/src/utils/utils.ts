import {
  getIconForFile,
  getIconForFolder,
  getIconForOpenFolder
} from 'vscode-material-icon-theme-js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Files } from '@common/api';

const VS_MATERIAL_ICONS =
  'https://cdn.jsdelivr.net/gh/PKief/vscode-material-icon-theme@master/icons';
const LS_COLOR_MODE_KEY = 'COLOR_MODE';

export function getBasename(filename: string) {
  const fileParts = filename.split('/');

  if (fileParts.length > 0) return fileParts[fileParts.length - 1];
  else return '';
}

export function getFileIcon(filename: string) {
  return `${VS_MATERIAL_ICONS}/${getIconForFile(filename)}`;
}

export function getFolderIcon(filename: string) {
  return `${VS_MATERIAL_ICONS}/${getIconForFolder(filename)}`;
}

export function getOpenFolderIcon(filename: string) {
  return `${VS_MATERIAL_ICONS}/${getIconForOpenFolder(filename)}`;
}

/* eslint-disable no-loop-func */
export function convertFilesToTree(files: Files) {
  let tree: any = [];

  for (const file in files) {
    const fileParts = file.split('/');
    let currentRoot = tree;

    fileParts.forEach((filePart, index) => {
      if (filePart.trim().length > 0) {
        const currentPath = fileParts.slice(0, index + 1).join('/');
        const node = currentRoot.find((node: any) => node.path === currentPath);

        if (!node) {
          const isDir = index !== fileParts.length - 1;
          const newNode = {
            id: currentPath,
            path: currentPath,
            isDir,
            children: []
          };

          currentRoot.push(newNode);
          currentRoot = currentRoot.sort((elem: any) => (elem.isDir ? -1 : 1));
          currentRoot = newNode.children;
        } else {
          if (!node.children) {
            node.children = [];
          }

          currentRoot = node.children;
        }
      }
    });
  }

  return tree;
}

export function getLanguageNameFromExt(filename: string) {
  const extLanguageMap = {
    tsx: 'TypeScript',
    js: 'JavaScript',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON'
  } as any;
  const [, ext] = filename.split('.');

  return extLanguageMap[ext];
}

export function getLanguageFromExt(filename: string) {
  const extLanguageMap = {
    tsx: 'javascript',
    js: 'javascript',
    css: 'css',
    html: 'html',
    json: 'json'
  } as any;
  const [, ext] = filename.split('.');

  return extLanguageMap[ext];
}

export function loadMonacoModels(files: Files) {
  monaco.editor.getModels().forEach((model) => model.dispose());

  for (const filePath in files) {
    monaco.editor.createModel(
      files[filePath].content,
      getLanguageFromExt(getBasename(filePath)),
      monaco.Uri.from({ path: filePath, scheme: 'file' })
    );
  }
}

export function getVimStatusContainerId() {
  return 'vim-status-container';
}

export function getColorMode(): 'dark' | 'light' {
  const colorMode = localStorage.getItem(LS_COLOR_MODE_KEY);

  if (colorMode === 'light') {
    return 'light';
  } else if (colorMode === 'dark') {
    return 'dark';
  } else {
    return 'dark';
  }
}

export function saveColorMode(colorMode: 'light' | 'dark') {
  localStorage.setItem(LS_COLOR_MODE_KEY, colorMode);
}
