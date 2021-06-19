import { Asset, DepGraph, Files } from '@common/api';
import * as babelParser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as Babel from '@babel/standalone';
import path from 'path';
import { getFileExtension } from '@common/utils';

export function createAsset(
  filePath: string,
  importer: string,
  files: Files
): Asset | null {
  const dependencies: string[] = [];
  const resolvedFileExtension = getFileExtension(path.basename(filePath));
  const file = files[filePath];

  if (['js', 'ts'].includes(resolvedFileExtension)) {
    const ast = babelParser.parse(file.content, {
      sourceType: 'module',
      plugins: ['jsx', 'decorators-legacy', 'classProperties']
    });

    babelTraverse(ast, {
      ImportDeclaration: (importDeclaration) => {
        dependencies.push(importDeclaration.node.source.value);
      }
    });

    const code = Babel.transform(file.content, {
      presets: ['env', 'react'],
      plugins: [
        [Babel.availablePlugins['proposal-decorators'], { legacy: true }],
        Babel.availablePlugins['proposal-class-properties']
      ]
    }).code;

    return {
      code,
      dependencies
    };
  } else if (resolvedFileExtension === 'css') {
    return {
      code: file.content,
      dependencies: []
    };
  } else if (resolvedFileExtension === 'json') {
    // check the validity of the json
    try {
      JSON.parse(file.content);
    } catch {
      throw new Error(
        `Invalid json module '${filePath}' imported from '${importer}'`
      );
    }

    const transformedCode = `
      module.exports = ${file.content};
    `;

    return {
      code: transformedCode,
      dependencies: []
    };
  } else {
    return null;
  }
}

export function findRemovedFiles(
  oldDepGraph: DepGraph,
  newDepGraph: DepGraph
): string[] {
  const removedFiles = [];

  for (const file in oldDepGraph) {
    if (!newDepGraph[file]) removedFiles.push(file);
  }

  return removedFiles;
}
