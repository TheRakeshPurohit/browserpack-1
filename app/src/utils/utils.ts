import {
  getIconForFile,
  getIconForFolder,
  getIconForOpenFolder
} from 'vscode-material-icon-theme-js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Manager } from 'smooshpack';

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
export function convertFilesToTree(files: Record<string, string>) {
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

export function loadMonacoModels(files: Record<string, { code: string }>) {
  monaco.editor.getModels().forEach((model) => model.dispose());

  for (const filePath in files) {
    monaco.editor.createModel(
      files[filePath].code,
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

export function startSandpack(ref: any) {
  const files = {
    '/src/index.jsx': {
      code: `\
  import React from "react";
  import { render } from "react-dom";
  
  import "./styles.css";
  
  function App() {
    return (
      <div className="App">
        <h1>Hello Readct</h1>
      </div>
    );
  }
  
  render(<App />, document.getElementById("app"));`
    },
    '/src/styles.css': {
      code: `\
  .App {
    font-family: sans-serif;
    text-align: center;
  }`
    },
    '/public/index.html': {
      code: `\
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Hello React</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="app"></div>
  </body>
  </html>`
    },
    // Manage dependency with package.json instead of `dependencies` object.
    '/package.json': {
      code: JSON.stringify(
        {
          name: 'react-app',
          version: '1.0.0',
          description: '',
          main: 'src/index.jsx',
          dependencies: {
            react: '16.8.3',
            'react-dom': '16.8.3'
            // "react-scripts": "2.1.8"
          }
        },
        null,
        2
      )
    }
  };

  new Manager(ref, {
    files,
    showOpenInCodeSandbox: false
  });
}
