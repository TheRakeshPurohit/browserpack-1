import { Asset, Files } from '@common/api';
import * as babelParser from '@babel/parser';
import babelTraverse from '@babel/traverse';
import * as Babel from '@babel/standalone';
import path from 'path';

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
      sourceType: 'module'
    });

    babelTraverse(ast, {
      ImportDeclaration: (importDeclaration) => {
        dependencies.push(importDeclaration.node.source.value);
      }
    });

    const code = Babel.transform(file.content, {
      presets: ['env']
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

export function getFileExtension(filename: string) {
  const filenameParts = filename.split('.');

  if (filenameParts.length === 1) return '';

  return filenameParts[filenameParts.length - 1];
}
